/* global __dirname */
const { Buffer } = require('node:buffer')
const { createRequire } = require('node:module')
const { readFile } = require('node:fs/promises')
const path = require('node:path')

// Use the rasterizer already shipped with the pinned Expo toolchain.
const expo = createRequire(require.resolve('expo/package.json'))
const cli = createRequire(expo.resolve('@expo/cli/package.json'))
const images = createRequire(cli.resolve('@expo/image-utils/package.json'))
const sharp = images('sharp')
const assets = path.join(__dirname, '../assets')

async function main() {
  const source = await readFile(path.join(assets, 'mark.svg'), 'utf8')
  const mark = source.replace(/<svg[^>]*>|<\/svg>/g, '')
  const logo = path.join(assets, 'association-logo.png')
  for (const [file, size] of [
    ['icon.png', 1024],
    ['adaptive-icon.png', 1024],
    ['splash-icon.png', 512],
    ['favicon.png', 64],
  ]) {
    await sharp(logo).resize(size, size, { fit: 'contain' }).png().toFile(path.join(assets, file))
  }
  const webPublic = path.join(__dirname, '../../web/public')
  for (const [file, size] of [
    ['favicon.png', 64],
    ['logo192.png', 192],
    ['logo512.png', 512],
  ]) {
    await sharp(logo).resize(size, size, { fit: 'contain' }).png().toFile(path.join(webPublic, file))
  }
  const svg = (size, inset, color, background) => Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    (background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : '') +
    `<svg x="${inset}" y="${inset}" width="${size - inset * 2}" height="${size - inset * 2}" viewBox="0 0 24 24" fill="none">` +
    mark.replaceAll('#234F40', color) + '</svg></svg>',
  )
  for (const [file, size, inset, color, background] of [
    ['monochrome-icon.png', 1024, 224, '#FFFFFF', null],
    ['notification-icon.png', 96, 8, '#FFFFFF', null],
  ]) {
    await sharp(svg(size, inset, color, background)).png().toFile(path.join(assets, file))
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
