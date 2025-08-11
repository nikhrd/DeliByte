// script.js
$(document).ready(function () {
    // Global variables
    let cart = [];
    let menuItems = [];
    let currentCategory = 'all';

    // API base URL - change this to your server URL
    const API_URL = 'http://localhost:3000/api';

    // Initialize the application
    init();

    function init() {
        loadMenuItems();
        setupEventListeners();
        updateCartDisplay();
    }

    // Event Listeners
    function setupEventListeners() {
        // Navigation
        $('nav a').click(function (e) {
            e.preventDefault();
            const target = $(this).attr('href');
            $('html, body').animate({
                scrollTop: $(target).offset().top - 80
            }, 800);
        });

        // Category filtering
        $('.category-btn').click(function () {
            $('.category-btn').removeClass('active');
            $(this).addClass('active');
            currentCategory = $(this).data('category');
            filterMenuItems();
        });

        // Cart modal
        $('#cartIcon').click(function () {
            displayCartItems();
            $('#cartModal').fadeIn(300);
        });

        $('#closeCart').click(function () {
            $('#cartModal').fadeOut(300);
        });

        // Checkout modal
        $('#orderBtn').click(function () {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            $('#cartModal').fadeOut(300);
            displayOrderSummary();
            $('#orderModal').fadeIn(300);
        });

        $('#closeOrder').click(function () {
            $('#orderModal').fadeOut(300);
        });

        // Clear cart
        $('#clearCart').click(function () {
            if (confirm('Are you sure you want to clear your cart?')) {
                cart = [];
                updateCartDisplay();
                displayCartItems();
            }
        });

        // Checkout form
        $('#orderForm').submit(function (e) {
            e.preventDefault();
            placeOrder();
        });

        // Close modals when clicking outside
        $('.modal').click(function (e) {
            if (e.target === this) {
                $(this).fadeOut(300);
            }
        });
    }

    // Load menu items from server
    function loadMenuItems() {
        $('#menuGrid').html('<div class="loading"></div>');

        $.get(`${API_URL}/menu`)
            .done(function (data) {
                menuItems = data;
                displayMenuItems();
            })
            .fail(function () {
                // Fallback to sample data if server is not available
                console.log('Server not available, using sample data');
                menuItems = getSampleMenuItems();
                displayMenuItems();
            });
    }

    // Sample menu items (fallback when server is not available)
    function getSampleMenuItems() {
        return [
            {
                _id: '1',
                name: 'Margherita Pizza',
                description: 'Fresh tomatoes, mozzarella cheese, basil leaves',
                price: 12.99,
                category: 'mains',
                image: '🍕'
            },
            {
                _id: '2',
                name: 'Caesar Salad',
                description: 'Crisp romaine lettuce, parmesan, croutons',
                price: 8.99,
                category: 'appetizers',
                image: '🥗'
            },
            {
                _id: '3',
                name: 'Grilled Salmon',
                description: 'Atlantic salmon with lemon herb seasoning',
                price: 18.99,
                category: 'mains',
                image: '🐟'
            },
            {
                _id: '4',
                name: 'Chocolate Cake',
                description: 'Rich chocolate cake with vanilla ice cream',
                price: 6.99,
                category: 'desserts',
                image: '🍰'
            },
            {
                _id: '5',
                name: 'Fresh Orange Juice',
                description: 'Freshly squeezed orange juice',
                price: 3.99,
                category: 'beverages',
                image: '🍊'
            },
            {
                _id: '6',
                name: 'Buffalo Wings',
                description: 'Spicy chicken wings with blue cheese dip',
                price: 9.99,
                category: 'appetizers',
                image: '🍗'
            },
            {
                _id: '7',
                name: 'Beef Burger',
                description: 'Juicy beef patty with lettuce, tomato, and fries',
                price: 14.99,
                category: 'mains',
                image: '🍔'
            },
            {
                _id: '8',
                name: 'Tiramisu',
                description: 'Classic Italian dessert with coffee and mascarpone',
                price: 7.99,
                category: 'desserts',
                image: '🍮'
            },
            {
                _id: '9',
                name: 'Iced Coffee',
                description: 'Cold brew coffee with milk and ice',
                price: 4.99,
                category: 'beverages',
                image: '☕'
            },
            {
                _id: '10',
                name: 'Garlic Bread',
                description: 'Toasted bread with garlic butter and herbs',
                price: 5.99,
                category: 'appetizers',
                image: '🥖'
            }
        ];
    }

    // Display menu items
    function displayMenuItems() {
        const filteredItems = currentCategory === 'all'
            ? menuItems
            : menuItems.filter(item => item.category === currentCategory);

        if (filteredItems.length === 0) {
            $('#menuGrid').html('<p style="text-align: center; grid-column: 1/-1;">No items found in this category.</p>');
            return;
        }

        const itemsHtml = filteredItems.map(item => `
            <div class="menu-item" data-category="${item.category}">
                <div class="menu-item-image">${item.image || '🍽️'}</div>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="menu-item-footer">
                    <span class="price">${item.price.toFixed(2)}</span>
                    <button class="add-to-cart" onclick="addToCart('${item._id}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');

        $('#menuGrid').html(itemsHtml);
    }

    // Filter menu items by category
    function filterMenuItems() {
        displayMenuItems();
    }

    // Add item to cart
    window.addToCart = function (itemId) {
        const item = menuItems.find(i => i._id === itemId);
        if (!item) return;

        const existingItem = cart.find(i => i._id === itemId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...item,
                quantity: 1
            });
        }

        updateCartDisplay();

        // Show feedback
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Added!';
        button.style.background = '#28a745';

        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#ff6b35';
        }, 1000);
    };

    // Update cart display
    function updateCartDisplay() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        $('#cartCount').text(totalItems);

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        $('#cartTotal').text(total.toFixed(2));
    }

    // Display cart items in modal
    function displayCartItems() {
        if (cart.length === 0) {
            $('#cartItems').html(`
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                </div>
            `);
            return;
        }

        const cartHtml = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>${item.price.toFixed(2)} each</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="updateQuantity('${item._id}', -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity('${item._id}', 1)">+</button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart('${item._id}')">Remove</button>
                </div>
            </div>
        `).join('');

        $('#cartItems').html(cartHtml);
    }

    // Update item quantity in cart
    window.updateQuantity = function (itemId, change) {
        const item = cart.find(i => i._id === itemId);
        if (!item) return;

        item.quantity += change;

        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCartDisplay();
            displayCartItems();
        }
    };

    // Remove item from cart
    window.removeFromCart = function (itemId) {
        cart = cart.filter(item => item._id !== itemId);
        updateCartDisplay();
        displayCartItems();
    };

    // Display order summary in checkout
    function displayOrderSummary() {
        const summaryHtml = cart.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>${item.name} x ${item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        $('#orderSummary').html(summaryHtml);

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        $('#finalTotal').text(total.toFixed(2));
    }

    // Place order
    function placeOrder() {
        const orderData = {
            customer: {
                name: $('#customerName').val(),
                email: $('#customerEmail').val(),
                phone: $('#customerPhone').val(),
                address: $('#customerAddress').val()
            },
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            orderDate: new Date()
        };

        // Show loading state
        $('#orderForm button[type="submit"]').text('Placing Order...').prop('disabled', true);

        $.ajax({
            url: `${API_URL}/orders`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(orderData)
        })
            .done(function (response) {
                alert(`Order placed successfully! Order ID: ${response.orderId}`);
                cart = [];
                updateCartDisplay();
                $('#orderModal').fadeOut(300);
                $('#orderForm')[0].reset();
            })
            .fail(function () {
                // Simulate successful order for demo purposes
                const orderId = 'ORDER' + Date.now();
                alert(`Order placed successfully! Order ID: ${orderId}`);
                cart = [];
                updateCartDisplay();
                $('#orderModal').fadeOut(300);
                $('#orderForm')[0].reset();
            })
            .always(function () {
                $('#orderForm button[type="submit"]').text('Place Order').prop('disabled', false);
            });
    }

    // Smooth scroll to menu
    window.scrollToMenu = function () {
        $('html, body').animate({
            scrollTop: $('#menu').offset().top - 80
        }, 800);
    };

    // Header scroll effect
    $(window).scroll(function () {
        const scrollTop = $(window).scrollTop();
        if (scrollTop > 100) {
            $('.header').addClass('scrolled');
        } else {
            $('.header').removeClass('scrolled');
        }
    });
});

// Additional CSS for header scroll effect
const style = document.createElement('style');
style.textContent = `
    .header.scrolled {
        background: rgba(0, 0, 0, 0.95);
        box-shadow: 0 2px 20px rgba(0,0,0,0.3);
    }
`;
document.head.appendChild(style);