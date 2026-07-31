const viewMoreBtn = document.getElementById('viewMoreBtn');
const hiddenCards = document.querySelectorAll('.hidden-card');
const menuCards = document.querySelectorAll('.menu-card');
const orderFab = document.querySelector('.order-fab');
const orderModal = document.getElementById('orderModal');
const closeOrderModal = document.getElementById('closeOrderModal');
const orderItems = document.getElementById('orderItems');
const orderTotal = document.getElementById('orderTotal');
const tableNumber = document.getElementById('tableNumber');
const confirmOrderBtn = document.getElementById('confirmOrderBtn');
const addButtons = document.querySelectorAll('.add-btn');

const order = [];

function applyFilter() {
  menuCards.forEach(card => {
    const isHiddenByViewMore = card.classList.contains('hidden-card') && viewMoreBtn.dataset.open !== 'true';
    card.style.display = isHiddenByViewMore ? 'none' : 'block';
  });
}

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function parsePrice(text) {
  return parseFloat(text.replace('$', '')) || 0;
}

function renderOrder() {
  if (order.length === 0) {
    orderItems.innerHTML = '<p class="ingredients">No items selected yet.</p>';
    orderTotal.textContent = formatPrice(0);
    return;
  }

  orderItems.innerHTML = order.map(item => `
    <div class="order-item">
      <div class="order-item-info">
        <strong>${item.name}</strong>
        <span class="order-item-price">${formatPrice(item.price * item.quantity)}</span>
      </div>
      <div class="order-actions">
        <label class="qty-control">
          <span>Qty</span>
          <input type="number" min="1" value="${item.quantity}" data-name="${item.name}" />
        </label>
        <button class="remove-item-btn" data-name="${item.name}" aria-label="Remove ${item.name}">×</button>
      </div>
    </div>
  `).join('');

  const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);
  orderTotal.textContent = formatPrice(total);

  orderItems.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', event => {
      const targetItem = order.find(item => item.name === event.target.dataset.name);
      if (!targetItem) return;

      const quantity = parseInt(event.target.value, 10);
      targetItem.quantity = Number.isNaN(quantity) || quantity < 1 ? 1 : quantity;
      renderOrder();
    });
  });

  orderItems.querySelectorAll('.remove-item-btn').forEach(button => {
    button.addEventListener('click', event => {
      const name = event.target.dataset.name;
      const index = order.findIndex(item => item.name === name);
      if (index !== -1) {
        order.splice(index, 1);
        renderOrder();
      }
    });
  });
}

function openOrderModal() {
  renderOrder();
  orderModal.classList.remove('is-hidden');
  orderModal.setAttribute('aria-hidden', 'false');
}

function closeOrderModalHandler() {
  orderModal.classList.add('is-hidden');
  orderModal.setAttribute('aria-hidden', 'true');
}

viewMoreBtn.addEventListener('click', () => {
  const isOpen = viewMoreBtn.dataset.open === 'true';
  hiddenCards.forEach(card => {
    card.style.display = isOpen ? 'none' : 'block';
  });

  viewMoreBtn.textContent = isOpen ? 'View More' : 'Show Less';
  viewMoreBtn.dataset.open = isOpen ? 'false' : 'true';
});

applyFilter();

addButtons.forEach(button => {
  button.addEventListener('click', event => {
    event.stopPropagation();

    const card = button.closest('.menu-card');
    const name = card.querySelector('h2').textContent.trim();
    const priceText = card.querySelector('.price').textContent.trim();
    const price = parsePrice(priceText);

    const existingItem = order.find(item => item.name === name);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      order.push({ name, price, quantity: 1 });
    }

    card.classList.add('is-selected');
    setTimeout(() => card.classList.remove('is-selected'), 250);
  });
});

menuCards.forEach(card => {
  card.addEventListener('click', () => {
    menuCards.forEach(item => item.classList.remove('is-selected'));
    card.classList.add('is-selected');
  });
});

orderFab.addEventListener('click', openOrderModal);
closeOrderModal.addEventListener('click', closeOrderModalHandler);
orderModal.addEventListener('click', event => {
  if (event.target === orderModal) {
    closeOrderModalHandler();
  }
});

confirmOrderBtn.addEventListener('click', () => {
  const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);
  alert(`Order confirmed for table ${tableNumber.value}.\nTotal: $${total.toFixed(2)}`);
  order.length = 0;
  renderOrder();
  closeOrderModalHandler();
});
