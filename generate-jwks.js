const { generateKeyPairSync, writeFileSync } = require('node:crypto');
const fs = require('fs/promises');

async function generateKeys() {
  try {
    await fs.mkdir('./keys', { recursive: true });
    // Tạo cặp khóa RSA
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,  // Độ dài khóa 2048 bit
      publicKeyEncoding: {
        type: 'spki',       // Định dạng public key
        format: 'pem'       // Định dạng PEM
      },
      privateKeyEncoding: {
        type: 'pkcs8',      // Định dạng private key
        format: 'pem',
      }
    });

    // Ghi ra file
    await fs.writeFile('./keys/privateKey.pem', privateKey);
    await fs.writeFile('./keys/publicKey.pem', publicKey);
    
    console.log('✅ Keys generated successfully!');
    console.log('🔑 Private key saved to privateKey.pem');
    console.log('🔐 Public key saved to publicKey.pem');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

generateKeys().catch(console.error);