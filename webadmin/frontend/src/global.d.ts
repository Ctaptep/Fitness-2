export {};

declare global {
  interface Window {
    Telegram: any; // Можно заменить any на более точный тип, если он известен
  }
}
