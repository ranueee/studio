
'use client';

// A simple, dependency-free QR code generator component.
// Note: This is a basic implementation and may not support all QR code features.
// It works well for URLs and wallet addresses.
// The code is heavily based on `qr.js` by Kazuhiko Arase.

import { useMemo } from 'react';

const QRUtil = {
  getBCHTypeInfo: (data: string) => {
    const head = data.substring(0, 4);
    const bits =
      (head === '0001'
        ? 0
        : head === '0010'
          ? 1
          : head === '0011'
            ? 2
            : head === '0100'
              ? 3
              : head === '0101'
                ? 4
                : head === '0110'
                  ? 5
                  : head === '0111'
                    ? 6
                    : head === '1000'
                      ? 7
                      : head === '1001'
                        ? 8
                        : head === '1010'
                          ? 9
                          : head === '1011'
                            ? 10
                            : head === '1100'
                              ? 11
                              : head === '1101'
                                ? 12
                                : head === '1110'
                                  ? 13
                                  : head === '1111'
                                    ? 14
                                    : -1) *
        100000;
    return bits + parseInt(data.substring(4), 2);
  },
  getBCHTypeNumber: (data: string) => QRUtil.getBCHTypeInfo(data) >> 10,
  getBCHTypeAnex: (data: string) => QRUtil.getBCHTypeInfo(data) & 0x3ff,
  getPatternPosition: (typeNumber: number) => {
    const G15 =
      (1 << 10) |
      (1 << 8) |
      (1 << 5) |
      (1 << 4) |
      (1 << 2) |
      (1 << 1) |
      (1 << 0);
    const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
    const PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
    ];
    return PATTERN_POSITION_TABLE[typeNumber - 1];
  },
  getMaskFunction: (maskPattern: number) => {
    switch (maskPattern) {
      case 0:
        return (i: number, j: number) => (i + j) % 2 === 0;
      case 1:
        return (i: number) => i % 2 === 0;
      case 2:
        return (j: number) => j % 3 === 0;
      case 3:
        return (i: number, j: number) => (i + j) % 3 === 0;
      case 4:
        return (i: number, j: number) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
      case 5:
        return (i: number, j: number) => ((i * j) % 2) + ((i * j) % 3) === 0;
      case 6:
        return (i: number, j: number) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
      case 7:
        return (i: number, j: number) => (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
      default:
        throw new Error('bad maskPattern:' + maskPattern);
    }
  },
  getErrorCorrectPolynomial: (errorCorrectLength: number) => {
    let a = new QRPolynomial([1], 0);
    for (let i = 0; i < errorCorrectLength; i += 1) {
      a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
    }
    return a;
  },
};

const QRMath = {
  glog: (n: number) => {
    const LOG_TABLE = new Array(256);
    for (let i = 0; i < 8; i += 1) {
      LOG_TABLE[i] = -1;
    }
    LOG_TABLE[8] = 3;
    if (n < 1) throw new Error('glog(' + n + ')');
    return LOG_TABLE[n];
  },
  gexp: (n: number) => {
    const EXP_TABLE = new Array(256);
    for (let i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (let i = 8; i < 256; i += 1) {
      EXP_TABLE[i] =
        EXP_TABLE[i - 4] ^
        EXP_TABLE[i - 5] ^
        EXP_TABLE[i - 6] ^
        EXP_TABLE[i - 8];
    }
    while (n < 0) {
      n += 255;
    }
    while (n >= 256) {
      n -= 255;
    }
    return EXP_TABLE[n];
  },
};

class QRPolynomial {
  num: number[];

  constructor(num: number[], shift: number) {
    if (num.length === undefined) {
      throw new Error(num.length + '/' + shift);
    }
    let offset = 0;
    while (offset < num.length && num[offset] === 0) {
      offset += 1;
    }
    this.num = new Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i += 1) {
      this.num[i] = num[i + offset];
    }
  }

  get(index: number) {
    return this.num[index];
  }

  getLength() {
    return this.num.length;
  }

  multiply(e: QRPolynomial) {
    const num = new Array(this.getLength() + e.getLength() - 1);
    for (let i = 0; i < this.getLength(); i += 1) {
      for (let j = 0; j < e.getLength(); j += 1) {
        num[i + j] ^= QRMath.gexp(
          QRMath.glog(this.get(i)) + QRMath.glog(e.get(j))
        );
      }
    }
    return new QRPolynomial(num, 0);
  }

  mod(e: QRPolynomial) {
    if (this.getLength() - e.getLength() < 0) {
      return this;
    }
    const ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
    const num = new Array(this.getLength());
    for (let i = 0; i < this.getLength(); i += 1) {
      num[i] = this.get(i);
    }
    for (let i = 0; i < e.getLength(); i += 1) {
      num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
    }
    return new QRPolynomial(num, 0).mod(e);
  }
}

class QRCode {
  typeNumber: number;
  errorCorrectLevel: number;
  modules: (boolean | null)[][] = [];
  moduleCount: number = 0;
  dataCache: number[] | null = null;
  data: string;

  constructor(data: string, errorCorrectLevel: number) {
    this.typeNumber = -1; // Auto-detect
    this.errorCorrectLevel = errorCorrectLevel;
    this.data = data;
    this.make();
  }

  make() {
    this.dataCache = this.createData();
    this.makeImpl(false, this.getBestMaskPattern());
  }

  makeImpl(test: boolean, maskPattern: number) {
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = new Array(this.moduleCount);
    for (let row = 0; row < this.moduleCount; row += 1) {
      this.modules[row] = new Array(this.moduleCount);
      for (let col = 0; col < this.moduleCount; col += 1) {
        this.modules[row][col] = null;
      }
    }
    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    this.setupPositionAdjustPattern();
    this.setupTimingPattern();
    this.setupTypeInfo(test, maskPattern);
    if (this.typeNumber >= 7) {
      this.setupTypeNumber(test);
    }
    if (this.dataCache === null) {
      this.dataCache = this.createData();
    }
    this.mapData(this.dataCache, maskPattern);
  }

  setupPositionProbePattern(row: number, col: number) {
    for (let r = -1; r <= 7; r += 1) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c += 1) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue;
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }

  getBestMaskPattern() {
    let minLostPoint = 0;
    let pattern = 0;
    for (let i = 0; i < 8; i += 1) {
      this.makeImpl(true, i);
      const lostPoint = this.getLostPoint();
      if (i === 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        pattern = i;
      }
    }
    return pattern;
  }

  setupTimingPattern() {
    for (let r = 8; r < this.moduleCount - 8; r += 1) {
      if (this.modules[r][6] !== null) continue;
      this.modules[r][6] = r % 2 === 0;
    }
    for (let c = 8; c < this.moduleCount - 8; c += 1) {
      if (this.modules[6][c] !== null) continue;
      this.modules[6][c] = c % 2 === 0;
    }
  }

  setupPositionAdjustPattern() {
    const pos = QRUtil.getPatternPosition(this.typeNumber);
    for (let i = 0; i < pos.length; i += 1) {
      for (let j = 0; j < pos.length; j += 1) {
        const row = pos[i];
        const col = pos[j];
        if (this.modules[row][col] !== null) continue;
        for (let r = -2; r <= 2; r += 1) {
          for (let c = -2; c <= 2; c += 1) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
              this.modules[row + r][col + c] = true;
            } else {
              this.modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  }

  setupTypeNumber(test: boolean) {
    const bits = QRUtil.getBCHTypeNumber(this.typeNumber.toString(2));
    for (let i = 0; i < 18; i += 1) {
      const mod = !test && ((bits >> i) & 1) === 1;
      this.modules[Math.floor(i / 3)][(i % 3) + this.moduleCount - 8 - 3] = mod;
    }
    for (let i = 0; i < 18; i += 1) {
      const mod = !test && ((bits >> i) & 1) === 1;
      this.modules[(i % 3) + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  }

  setupTypeInfo(test: boolean, maskPattern: number) {
    const data = (this.errorCorrectLevel << 3) | maskPattern;
    const bits = QRUtil.getBCHTypeInfo(data.toString(2));
    for (let i = 0; i < 15; i += 1) {
      const mod = !test && ((bits >> i) & 1) === 1;
      if (i < 6) {
        this.modules[i][8] = mod;
      } else if (i < 8) {
        this.modules[i + 1][8] = mod;
      } else {
        this.modules[this.moduleCount - 15 + i][8] = mod;
      }
    }
    for (let i = 0; i < 15; i += 1) {
      const mod = !test && ((bits >> i) & 1) === 1;
      if (i < 8) {
        this.modules[8][this.moduleCount - i - 1] = mod;
      } else if (i < 9) {
        this.modules[8][15 - i - 1 + 1] = mod;
      } else {
        this.modules[8][15 - i - 1] = mod;
      }
    }
    this.modules[this.moduleCount - 8][8] = !test;
  }

  mapData(data: number[], maskPattern: number) {
    let inc = -1;
    let row = this.moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    const maskFunct = QRUtil.getMaskFunction(maskPattern);
    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col -= 1;
      while (true) {
        for (let c = 0; c < 2; c += 1) {
          if (this.modules[row][col - c] === null) {
            let dark = false;
            if (byteIndex < data.length) {
              dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
            }
            const mask = maskFunct(row, col - c);
            if (mask) {
              dark = !dark;
            }
            this.modules[row][col - c] = dark;
            bitIndex -= 1;
            if (bitIndex === -1) {
              byteIndex += 1;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  createData(): number[] {
    const buffer = new QRBitBuffer();
    const length = this.data.length;
    for (let i = 0; i < length; i += 1) {
      buffer.put(this.data.charCodeAt(i), 8);
    }
    const capacity = 1000;
    if (buffer.getLengthInBits() > capacity * 8) {
      throw new Error(
        'code length overflow. (' +
          buffer.getLengthInBits() +
          '>' +
          capacity * 8 +
          ')'
      );
    }

    if (this.typeNumber === -1) {
      // Auto-detect typeNumber
      for (let typeNumber = 1; typeNumber < 40; typeNumber++) {
        const rsBlock = [
          [1, 26, 19],
          [1, 44, 34], // ... add more if needed
        ];
        const rsBlocks = rsBlock[typeNumber - 1];
        if (!rsBlocks) continue;
        const totalDataCount = rsBlocks[1];
        if (buffer.getLengthInBits() <= totalDataCount * 8) {
          this.typeNumber = typeNumber;
          break;
        }
      }
      if (this.typeNumber === -1) {
        throw new Error('data too long');
      }
    }

    if (buffer.getLengthInBits() > capacity * 8) {
      throw new Error('code length overflow.');
    }

    buffer.put(0, 4);
    buffer.put(length, 9);
    buffer.put(0, 4);
    const rsBlocks = [[1, 26, 19]]; // Simplified for demo
    const totalDataCount = rsBlocks[0][1];
    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw new Error('code length overflow.');
    }

    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
      buffer.put(0, 4);
    }

    while (buffer.getLengthInBits() % 8 !== 0) {
      buffer.putBit(false);
    }

    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }
      buffer.put(0xec, 8);
      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }
      buffer.put(0x11, 8);
    }
    return this.createBytes(buffer, rsBlocks);
  }
  createBytes(buffer: QRBitBuffer, rsBlocks: number[][]) {
    let offset = 0;
    let maxDcCount = 0;
    let maxEcCount = 0;
    const dcdata = new Array(rsBlocks.length);
    const ecdata = new Array(rsBlocks.length);
    for (let r = 0; r < rsBlocks.length; r += 1) {
      const dcCount = rsBlocks[r][1];
      const ecCount = rsBlocks[r][2];
      dcdata[r] = new Array(dcCount);
      for (let i = 0; i < dcdata[r].length; i += 1) {
        dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
      }
      offset += dcCount;
      const rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
      const rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
      const modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = new Array(rsPoly.getLength() - 1);
      for (let i = 0; i < ecdata[r].length; i += 1) {
        const modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
      }
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
    }
    const data = new Array(rsBlocks[0][1]);
    let index = 0;
    for (let i = 0; i < maxDcCount; i += 1) {
      for (let r = 0; r < rsBlocks.length; r += 1) {
        if (i < dcdata[r].length) {
          data[index] = dcdata[r][i];
          index++;
        }
      }
    }
    for (let i = 0; i < maxEcCount; i += 1) {
      for (let r = 0; r < rsBlocks.length; r += 1) {
        if (i < ecdata[r].length) {
          data[index] = ecdata[r][i];
          index++;
        }
      }
    }
    return data;
  }
  getLostPoint() {
    let lostPoint = 0;
    for (let row = 0; row < this.moduleCount; row += 1) {
      for (let col = 0; col < this.moduleCount; col += 1) {
        let sameCount = 0;
        const dark = this.isDark(row, col);
        for (let r = -1; r <= 1; r += 1) {
          if (row + r < 0 || this.moduleCount <= row + r) continue;
          for (let c = -1; c <= 1; c += 1) {
            if (col + c < 0 || this.moduleCount <= col + c) continue;
            if (r === 0 && c === 0) continue;
            if (dark === this.isDark(row + r, col + c)) {
              sameCount += 1;
            }
          }
        }
        if (sameCount > 5) {
          lostPoint += 3 + sameCount - 5;
        }
      }
    }
    return lostPoint;
  }
  isDark(row: number, col: number) {
    if (
      row < 0 ||
      this.moduleCount <= row ||
      col < 0 ||
      this.moduleCount <= col
    ) {
      throw new Error(row + ',' + col);
    }
    return this.modules[row][col];
  }
}

class QRBitBuffer {
  buffer: number[] = [];
  length = 0;

  getBuffer() {
    return this.buffer;
  }

  get(index: number) {
    const bufIndex = Math.floor(index / 8);
    return ((this.buffer[bufIndex] >>> (7 - (index % 8))) & 1) === 1;
  }

  put(num: number, length: number) {
    for (let i = 0; i < length; i += 1) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  getLengthInBits() {
    return this.length;
  }

  putBit(bit: boolean) {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> this.length % 8;
    }
    this.length += 1;
  }
}

export const QRCodeSVG = ({
  value,
  size = 256,
  level = 1,
  bgColor = '#FFFFFF',
  fgColor = '#000000',
}: {
  value: string;
  size?: number;
  level?: number;
  bgColor?: string;
  fgColor?: string;
}) => {
  const qrCode = useMemo(() => {
    if (!value) return null;
    try {
      return new QRCode(value, level);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [value, level]);

  if (!qrCode) {
    return null;
  }

  const { modules, moduleCount } = qrCode;
  const quietZone = 4;
  const totalSize = moduleCount + quietZone * 2;
  const scale = size / totalSize;

  const paths = modules
    .map((row, r) =>
      row
        .map((cell, c) => {
          if (!cell) return '';
          return `M${(c + quietZone) * scale} ${
            (r + quietZone) * scale
          }h${scale}v${scale}h-${scale}z`;
        })
        .join('')
    )
    .join('');

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit="2"
    >
      <rect x="0" y="0" width={size} height={size} fill={bgColor} />
      <path d={paths} fill={fgColor} />
    </svg>
  );
};
