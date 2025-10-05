// Minimal type shim to appease TS when the library lacks types
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { RefreshControl } = require('react-native-web-refresh-control');

export default RefreshControl as import('react-native').RefreshControl;
