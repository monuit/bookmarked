import * as RNIap from 'react-native-iap';

let connected = false;
let products = [];

export async function initIAP() {
  if (connected) return true;
  try {
    await RNIap.initConnection();
    connected = true;
    return true;
  } catch (e) {
    connected = false;
    return false;
  }
}

export async function fetchProducts() {
  const ids = (process.env.EXPO_PUBLIC_IOS_PRODUCT_IDS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!ids.length) return [];
  try {
    products = await RNIap.getProducts({ skus: ids });
    return products;
  } catch {
    return [];
  }
}

export async function buy(productId) {
  try {
    return await RNIap.requestPurchase({ sku: productId, andDangerouslyFinishTransactionAutomatically: true });
  } catch (e) {
    throw e;
  }
}

export async function restore() {
  try {
    return await RNIap.getAvailablePurchases();
  } catch (e) {
    throw e;
  }
}

export async function end() {
  try {
    await RNIap.endConnection();
  } catch {}
  connected = false;
}
