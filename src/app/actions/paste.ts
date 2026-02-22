"use server";

import { supabase } from '@/lib/supabase';
import {
    generateSymmetricKey,
    encryptText,
    encryptSymmetricKey,
    hashPassword,
    verifyPassword,
    decryptSymmetricKey,
    decryptText
} from '@/lib/encryption';
import Hashids from 'hashids';

// Initialize Hashids with our secure salt and our custom Base58 alphabet (no 0, O, I, l)
const hashids = new Hashids(
    process.env.HASHIDS_SALT || 'default-salt-fallback',
    7, // Minimum length
    '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz' // Base58
);

export async function createPaste(data: {
    content: string;
    language?: string;
    password?: string;
    burnAfterReading?: boolean;
}) {
    try {
        // 1MB size limit
        if (Buffer.byteLength(data.content, 'utf8') > 1 * 1024 * 1024) {
            return { success: false, error: 'Paste content exceeds the 1MB limit' };
        }

        const symKey = generateSymmetricKey();
        const encryptedContent = encryptText(data.content, symKey);
        const encryptedSymKey = encryptSymmetricKey(symKey);

        let passHash: string | null = null;
        if (data.password) {
            passHash = await hashPassword(data.password);
        }

        const { data: inserted, error } = await supabase
            .from('notes')
            .insert({
                content: encryptedContent,
                symmetric_key: encryptedSymKey,
                password_hash: passHash,
                language: data.language || 'plaintext',
                burn_after_reading: !!data.burnAfterReading
            })
            .select('id, internal_id')
            .single();

        if (error) {
            console.error('Insert Error:', error);
            return { success: false, error: 'Database error' };
        }

        // Generate deterministic short URL using the new internal_id
        const newShortUrl = hashids.encode(inserted.internal_id);

        // Update the paste with its short URL
        const { error: updateError } = await supabase
            .from('notes')
            .update({ short_url: newShortUrl })
            .eq('id', inserted.id);

        if (updateError) {
            console.error('Update Error (short_url):', updateError);
            return { success: false, error: 'Failed to generate short link' };
        }

        return { success: true, shortUrl: newShortUrl };
    } catch (err) {
        console.error('Server Action Error:', err);
        return { success: false, error: 'Internal server error', details: String(err) };
    }
}

export async function getPaste(shortUrl: string) {
    try {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('short_url', shortUrl)
            .single();

        if (error || !data) {
            return { success: false, error: 'Paste not found' };
        }

        // If protected, let client know it needs unlocking
        if (data.password_hash) {
            return {
                success: true,
                isProtected: true,
                language: data.language,
                burnAfterReading: data.burn_after_reading
            };
        }

        // If not protected, decrypt directly
        const symKey = decryptSymmetricKey(data.symmetric_key);
        const decryptedContent = decryptText(data.content, symKey);

        // If burn after reading, delete immediately
        if (data.burn_after_reading) {
            await supabase.from('notes').delete().eq('id', data.id);
        }

        return {
            success: true,
            isProtected: false,
            content: decryptedContent,
            language: data.language,
            burnAfterReading: data.burn_after_reading
        };
    } catch (err) {
        console.error('Server Action Error:', err);
        return { success: false, error: 'Internal server error' };
    }
}

export async function unlockPaste(shortUrl: string, password: string) {
    try {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('short_url', shortUrl)
            .single();

        if (error || !data) {
            return { success: false, error: 'Paste not found' };
        }

        if (!data.password_hash) {
            return { success: false, error: 'Paste is not protected' };
        }

        const isValid = await verifyPassword(password, data.password_hash);
        if (!isValid) {
            return { success: false, error: 'Incorrect password' };
        }

        const symKey = decryptSymmetricKey(data.symmetric_key);
        const decryptedContent = decryptText(data.content, symKey);

        if (data.burn_after_reading) {
            await supabase.from('notes').delete().eq('id', data.id);
        }

        return {
            success: true,
            content: decryptedContent,
            language: data.language,
            burnAfterReading: data.burn_after_reading
        };
    } catch (err) {
        console.error('Server Action Error:', err);
        return { success: false, error: 'Internal server error' };
    }
}

export async function updatePaste(data: {
    shortUrl: string;
    newContent: string;
    newLanguage?: string;
    password?: string;
}) {
    try {
        // 1MB size limit
        if (Buffer.byteLength(data.newContent, 'utf8') > 1 * 1024 * 1024) {
            return { success: false, error: 'Paste content exceeds the 1MB limit' };
        }

        const { data: pasteRow, error } = await supabase
            .from('notes')
            .select('*')
            .eq('short_url', data.shortUrl)
            .single();

        if (error || !pasteRow) {
            return { success: false, error: 'Paste not found' };
        }

        // Verify password if the paste is protected
        if (pasteRow.password_hash) {
            if (!data.password) {
                return { success: false, error: 'Password required to edit this paste' };
            }
            const isValid = await verifyPassword(data.password, pasteRow.password_hash);
            if (!isValid) {
                return { success: false, error: 'Incorrect password' };
            }
        }

        // Decrypt the existing symmetric key
        const symKey = decryptSymmetricKey(pasteRow.symmetric_key);

        // Encrypt the new content
        const encryptedNewContent = encryptText(data.newContent, symKey);

        const { error: updateError, count } = await supabase
            .from('notes')
            .update({
                content: encryptedNewContent,
                language: data.newLanguage || pasteRow.language,
                // created_at is not updated, we keep the original creation time
            }, { count: 'exact' })
            .eq('id', pasteRow.id);

        if (updateError) {
            console.error('Update Error:', updateError);
            return { success: false, error: 'Failed to save changes' };
        }

        console.log('Update result - Rows affected:', count);
        if (count === 0) {
            return { success: false, error: 'No rows were updated' };
        }

        return { success: true };
    } catch (err) {
        console.error('Server Action Error:', err);
        return { success: false, error: 'Internal server error', details: String(err) };
    }
}
