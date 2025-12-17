///////////////////////////////////////////////////////////////////////
// Common Tunebook.app ABC Utility Functions
// https://github.com/anton-bregolas/
// MIT License
// (c) Anton Zille 2025
///////////////////////////////////////////////////////////////////////

////////////////////////////////
// COMPRESS / DECOMPRESS ABC
////////////////////////////////

// Compress ABC text using browser-native deflate algorithm
// Make the encoded text URL-safe using base64 helpers

export async function deflateCompress(abcRaw) {
  const data = new TextEncoder().encode(abcRaw);
  const stream = new Blob([data]).stream();
  const compressedStream = stream.pipeThrough(new CompressionStream('deflate'));
  const compressedBuffer = await new Response(compressedStream).arrayBuffer();
  return arrayBufferToBase64Url(compressedBuffer);
}

// Decompress URL-safe ABC text encoded by deflate algorithm

export async function deflateDecompress(abcEncoded) {
  const compressedBuffer = base64UrlToArrayBuffer(abcEncoded);
  const stream = new Blob([compressedBuffer]).stream();
  const decompressedStream = stream.pipeThrough(new DecompressionStream('deflate'));
  const decompressedBuffer = await new Response(decompressedStream).arrayBuffer();
  return new TextDecoder().decode(decompressedBuffer);
}

////////////////////////////////
// HELPER BASE64 FUNCTIONS
////////////////////////////////

// Convert ArrayBuffer to URL-safe Base64

function arrayBufferToBase64Url(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')   // Replace + with -
    .replace(/\//g, '_')   // Replace / with _
    .replace(/=+$/, '');   // Remove padding
}

// Convert URL-safe Base64 to ArrayBuffer

function base64UrlToArrayBuffer(base64url) {
  let base64 = base64url
    .replace(/-/g, '+')    // Restore +
    .replace(/_/g, '/');   // Restore /
  
  // Add back padding if needed
  const padLen = (4 - (base64.length % 4)) % 4;
  base64 += '='.repeat(padLen);
  
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}