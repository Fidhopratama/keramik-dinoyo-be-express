"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidIndonesianMobileNumber = isValidIndonesianMobileNumber;
exports.isDetailedAddress = isDetailedAddress;
exports.parseProductPrice = parseProductPrice;
const MAX_PRODUCT_PRICE = 9999999999.99;
function isValidIndonesianMobileNumber(value) {
    if (typeof value !== 'string' || !/^\+?[\d\s().-]+$/.test(value.trim())) {
        return false;
    }
    const digits = value.replace(/\D/g, '');
    return /^(?:08\d{8,11}|628\d{8,11})$/.test(digits);
}
function isDetailedAddress(value) {
    if (typeof value !== 'string') {
        return false;
    }
    const address = value.trim();
    return address.length >= 15 && address.split(/\s+/).length >= 3;
}
function parseProductPrice(value) {
    if (typeof value !== 'number' && typeof value !== 'string') {
        return null;
    }
    const price = String(value).trim().replace(/^rp\s*/i, '');
    if (!price) {
        return null;
    }
    let normalizedPrice;
    if (/^\d+(?:\.\d{1,2})?$/.test(price)) {
        normalizedPrice = price;
    }
    else if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(price)) {
        normalizedPrice = price
            .replace(/\./g, '')
            .replace(',', '.');
    }
    else if (/^\d+,\d{1,2}$/.test(price)) {
        normalizedPrice = price.replace(',', '.');
    }
    else {
        return null;
    }
    const parsedPrice = Number(normalizedPrice);
    if (!Number.isFinite(parsedPrice) ||
        parsedPrice < 0 ||
        parsedPrice > MAX_PRODUCT_PRICE) {
        return null;
    }
    return parsedPrice;
}
