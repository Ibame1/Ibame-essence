#!/usr/bin/env python3
"""Lossless JPEG privacy strip: removes EXIF/XMP/IPTC/MPF segments (GPS, device, timestamps) and
any trailing data after the image. Pixel data is untouched (verified by the caller).
Usage: python3 tools/strip-exif.py file.jpg [more.jpg ...]   (rewrites in place)"""
import sys

def strip(data: bytes) -> bytes:
    if data[:2] != b'\xff\xd8':
        raise ValueError('not a JPEG')
    out, i, n = bytearray(b'\xff\xd8'), 2, len(data)
    while i < n:
        if data[i] != 0xFF:
            raise ValueError(f'bad marker at {i}')
        while data[i + 1] == 0xFF:
            i += 1
        m = data[i + 1]
        if m == 0xD9:
            out += b'\xff\xd9'
            break
        if m == 0x01 or 0xD0 <= m <= 0xD7:
            out += data[i:i + 2]; i += 2; continue
        L = int.from_bytes(data[i + 2:i + 4], 'big')
        seg = data[i:i + 2 + L]
        body = seg[4:]
        drop = (m == 0xE1 and (body.startswith(b'Exif\0\0') or body.startswith(b'http://ns.adobe.com/xap/1.0/'))) \
            or (m == 0xE2 and body.startswith(b'MPF\0')) or m in (0xED, 0xFE)
        if not drop:
            out += seg
        i += 2 + L
        if m == 0xDA:  # entropy-coded data up to the next real marker
            j = i
            while j < n - 1 and not (data[j] == 0xFF and data[j + 1] not in (0x00, 0xFF) and not 0xD0 <= data[j + 1] <= 0xD7):
                j += 1
            out += data[i:j]; i = j
    return bytes(out)

if __name__ == '__main__':
    for path in sys.argv[1:]:
        raw = open(path, 'rb').read()
        clean = strip(raw)
        open(path, 'wb').write(clean)
        print(f'{path}: {len(raw)} -> {len(clean)} bytes')
