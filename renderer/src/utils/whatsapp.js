export async function sendWhatsApp(phone, message) {
  return window.api.sendWhatsappMessage({
    phone,
    message,
  });
}