function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export async function generateEncryptedKeys(password) {
    const enc = new TextEncoder();

    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );

    const fixedSalt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

    const material = await window.crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    const derivedKey = await window.crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: fixedSalt, iterations: 100000, hash: "SHA-256" },
        material,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );

    // 3. Private Key'i Şifrele
    const privateKeyBuffer = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Rastgele IV
    const encryptedContent = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        derivedKey,
        privateKeyBuffer
    );

    // 4. BÜYÜ BURADA: IV ve Şifreli Veriyi Birleştiriyoruz
    // [IV (12 byte)] + [Şifreli Veri] = Tek Bir Buffer
    const combinedBuffer = new Uint8Array(iv.byteLength + encryptedContent.byteLength);
    combinedBuffer.set(iv);
    combinedBuffer.set(new Uint8Array(encryptedContent), iv.byteLength);

    // 5. Public Key'i hazırla
    const publicKeyBuffer = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);

    // SONUÇ: Sadece iki temiz değişken
    return {
        publicKey: arrayBufferToBase64(publicKeyBuffer),
        encryptedPrivateKey: arrayBufferToBase64(combinedBuffer.buffer) // IV içinde gizli
    };
}