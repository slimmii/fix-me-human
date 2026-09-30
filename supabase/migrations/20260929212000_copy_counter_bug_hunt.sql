insert into public.pfh_bug_hunts
  (slug, title, brief, starter_files, test_code, "publishDateTime")
values (
  'the-copy-counter',
  'The copy counter',
  E'The café cart has gone rogue. Three bugs are hiding in the spread operators across these two files.\n\nIt should start empty. Adding a product should create one line, then increase that line''s quantity when the same product is added again. The plus and minus buttons should update only the selected item, and removing an item should leave the other items intact. The total should always match the cart.\n\nKeep the existing button labels and data-testid attributes so the checks can use the cart. Fix the immutable updates, then run the checks.',
  jsonb_build_object(
    'App.tsx', $code$import { useState } from "react";
import { Cart, type CartItem } from "./Cart";

const products = [
  { id: "coffee", name: "Coffee", price: 3 },
  { id: "tea", name: "Tea", price: 2 },
  { id: "cake", name: "Cake", price: 4 },
];

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);

  function addToCart(product: Omit<CartItem, "quantity">) {
    const existing = cart.find((item) => item.id === product.id);
    setCart([
      ...cart,
      { ...product, quantity: existing ? existing.quantity + 1 : 1 },
    ]);
  }

  function changeQuantity(id: string, amount: number) {
    const updated = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: item.quantity + amount }
        : item,
    );
    setCart([...updated.filter((item) => item.id !== id)]);
  }

  function removeFromCart(id: string) {
    const remaining = [
      ...cart.filter((item) => item.id !== id),
      ...cart.filter((item) => item.id === id),
    ];
    setCart(remaining);
  }

  return (
    <div>
      <h1>Café Counter</h1>
      <section aria-label="Products">
        {products.map((product) => (
          <button
            key={product.id}
            data-testid={`add-${product.id}`}
            onClick={() => addToCart(product)}
          >
            Add {product.name}
          </button>
        ))}
      </section>
      <Cart
        items={cart}
        onChangeQuantity={changeQuantity}
        onRemove={removeFromCart}
      />
    </div>
  );
}
$code$,
    'Cart.tsx', $code$export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartProps = {
  items: CartItem[];
  onChangeQuantity: (id: string, amount: number) => void;
  onRemove: (id: string) => void;
};

export function Cart({ items, onChangeQuantity, onRemove }: CartProps) {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <section aria-label="Cart">
      {items.length === 0 ? (
        <p data-testid="empty">Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {items.map((item) => (
              <li key={item.id} data-testid={`line-${item.id}`}>
                <span>{item.name}</span>
                <span data-testid={`quantity-${item.id}`}>
                  {item.quantity}
                </span>
                <button
                  data-testid={`plus-${item.id}`}
                  onClick={() => onChangeQuantity(item.id, 1)}
                >
                  +
                </button>
                <button
                  data-testid={`minus-${item.id}`}
                  onClick={() => onChangeQuantity(item.id, -1)}
                >
                  −
                </button>
                <button
                  data-testid={`remove-${item.id}`}
                  onClick={() => onRemove(item.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <p data-testid="total">Total: €{total}</p>
        </>
      )}
    </section>
  );
}
$code$),
  $tests$const text = (root, selector) =>
  root.querySelector(selector)?.textContent?.trim();

test("Start with an empty cart", ({ root, assert }) => {
  assert(
    text(root, '[data-testid="empty"]') === "Your cart is empty.",
    "The cart should start empty.",
  );
});

test("Adding the same product twice keeps one line and raises its quantity", async ({
  root,
  assert,
  click,
}) => {
  await click('[data-testid="add-coffee"]');
  await click('[data-testid="add-coffee"]');
  assert(
    root.querySelectorAll('[data-testid="line-coffee"]').length === 1,
    "The same product should stay on one cart line.",
  );
  assert(
    text(root, '[data-testid="quantity-coffee"]') === "2",
    "Adding the same product twice should set its quantity to 2.",
  );
});

test("Quantity controls update only the selected item", async ({
  root,
  assert,
  click,
}) => {
  await click('[data-testid="add-coffee"]');
  await click('[data-testid="add-tea"]');
  await click('[data-testid="plus-coffee"]');
  assert(
    text(root, '[data-testid="quantity-coffee"]') === "2",
    "The selected product should increase to 2.",
  );
  assert(
    text(root, '[data-testid="quantity-tea"]') === "1",
    "Changing coffee must not change tea.",
  );
});

test("Removing one item preserves the other item and total", async ({
  root,
  assert,
  click,
}) => {
  await click('[data-testid="add-coffee"]');
  await click('[data-testid="add-tea"]');
  await click('[data-testid="remove-coffee"]');
  assert(
    root.querySelector('[data-testid="line-coffee"]') === null,
    "Removed products should leave the cart.",
  );
  assert(
    root.querySelector('[data-testid="line-tea"]') !== null,
    "Removing coffee must preserve tea.",
  );
  assert(
    text(root, '[data-testid="total"]') === "Total: €2",
    "The total should include the remaining tea.",
  );
});
$tests$,
  now()
)
on conflict (slug) do nothing;
