document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan") || "DevPilot Pro";

  const rawPrice = params.get("price");
  const price = rawPrice !== null ? parseFloat(rawPrice) : 29;

  const tax = +(price * 0.09).toFixed(2);
  const total = (price + tax).toFixed(2);

  document.getElementById("planName").textContent = plan;
  document.getElementById("subtotal").textContent = `$${price.toFixed(2)}`;
  document.getElementById("tax").textContent = `$${tax}`;
  document.getElementById("total").textContent = `$${total}`;
});

// --- Format Card Number Automatically ---
const cardNumberInput = document.getElementById("cardNumber");
cardNumberInput.addEventListener("input", (e) => {
  let value = e.target.value.replace(/\D/g, "");
  value = value.match(/.{1,4}/g)?.join(" ") || "";
  e.target.value = value;
});

// --- Payment Validation ---
document.getElementById("paymentForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const cardNum = cardNumberInput.value.replace(/\s+/g, "");
  const expiry = document.getElementById("expiry").value.trim();
  const cvv = document.getElementById("cvv").value.trim();
  const message = document.getElementById("paymentMessage");

  // --- CARD LENGTH & LUHN CHECK ---
  if (cardNum.length < 13 || cardNum.length > 19) {
    message.textContent = "❌ Card number must be between 13 and 19 digits.";
    message.className = "mt-4 text-red-500 font-semibold";
    return;
  }

  if (!isValidCard(cardNum)) {
    message.textContent = "❌ Invalid credit card number.";
    message.className = "mt-4 text-red-500 font-semibold";
    return;
  }

  // --- EXPIRY CHECK ---
  if (!isValidExpiry(expiry)) {
    message.textContent = "❌ Invalid expiry date.";
    message.className = "mt-4 text-red-500 font-semibold";
    return;
  }

  // --- CVV CHECK ---
  if (!/^[0-9]{3,4}$/.test(cvv)) {
    message.textContent = "❌ Invalid CVV.";
    message.className = "mt-4 text-red-500 font-semibold";
    return;
  }

  if (!isValidCard(cardNum)) {
    message.textContent = "❌ Invalid credit card number (failed Luhn check).";
    message.className = "mt-4 text-red-500 font-semibold";
    return;
  }

  // Detect brand
  const brand = detectCardBrand(cardNum);
  if (!brand) {
    message.textContent = "❌ Unknown or unsupported card type.";
    message.className = "mt-4 text-red-500 font-semibold";
    return;
  }

  // --- APPROVED ---
  // --- APPROVED ---
  message.textContent = "✅ Payment Approved!";
  message.className = "mt-4 text-green-500 font-semibold";

  // Clear form after a short delay
  setTimeout(() => {
    document.getElementById("paymentForm").reset();
    cardNumberInput.value = ""; // also clear formatted card number box
  }, 800);
});

// --- Luhn Algorithm ---
function isValidCard(num) {
  if (!/^[0-9]{13,19}$/.test(num)) return false;

  let sum = 0;
  let doubleDigit = false;

  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num.charAt(i));
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

// --- Expiry Validation ---
function isValidExpiry(expiry) {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;

  const [month, year] = expiry.split("/").map(Number);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  return year > currentYear || (year === currentYear && month >= currentMonth);
}

// --- Card Brand Patterns ---
const CARD_BRANDS = [
  {
    name: "Visa",
    pattern: /^4[0-9]{12}(?:[0-9]{3})?$/,
    prefix: /^4/,
    icon: "assets/cards/visa.png",
  },
  {
    name: "Mastercard",
    pattern:
      /^(5[1-5][0-9]{14}|2(?:2[2-9][0-9]{2}|2[3-9][0-9]{3}|[3-6][0-9]{4}|7[01][0-9]{3}|720[0-9]{2}))[0-9]*$/,
    prefix: /^(5[1-5]|22[2-9]|2[3-7])/,
    icon: "assets/cards/mastercard.png",
  },
  {
    name: "American Express",
    pattern: /^3[47][0-9]{13}$/,
    prefix: /^3[47]/,
    icon: "assets/cards/amex.png",
  },
  {
    name: "Discover",
    pattern: /^(6011|65|64[4-9])[0-9]{12,15}$/,
    prefix: /^(6011|65|64[4-9])/,
    icon: "assets/cards/discover.png",
  },
];

// --- Detect Card Brand ---
function detectCardBrand(number) {
  for (const card of CARD_BRANDS) {
    if (card.prefix.test(number)) return card;
  }
  return null;
}

const cardBrandIcon = document.getElementById("cardBrandIcon");

// --- Update Card Logo As User Types ---
cardNumberInput.addEventListener("input", (e) => {
  let raw = e.target.value.replace(/\D/g, "");

  // Format number into XXXX XXXX XXXX XXXX
  let value = raw.match(/.{1,4}/g)?.join(" ") || "";
  e.target.value = value;

  // Detect brand
  const brand = detectCardBrand(raw);

  if (brand) {
    cardBrandIcon.src = brand.icon;
    cardBrandIcon.alt = brand.name;
    cardBrandIcon.style.opacity = "1";
  } else {
    cardBrandIcon.style.opacity = "0";
  }
});
