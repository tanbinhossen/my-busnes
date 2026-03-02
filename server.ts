import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("logeachi.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    cost_price REAL NOT NULL,
    image_url TEXT,
    category TEXT,
    stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, confirmed, delivered, cancelled
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    price_at_purchase REAL,
    cost_at_purchase REAL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Products
  app.get("/api/products", (req, res) => {
    try {
      const products = db.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", (req, res) => {
    try {
      const { name, description, price, cost_price, image_url, category, stock } = req.body;
      console.log("Adding product:", req.body);
      
      if (!name || price === undefined || cost_price === undefined) {
        return res.status(400).json({ error: "Name, price, and cost price are required" });
      }

      const info = db.prepare(`
        INSERT INTO products (name, description, price, cost_price, image_url, category, stock)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        name, 
        description || "", 
        price, 
        cost_price, 
        image_url || "", 
        category || "", 
        stock || 0
      );
      
      console.log("Product added with ID:", info.lastInsertRowid);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Orders
  app.get("/api/orders", (req, res) => {
    const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
    // For each order, get items
    const ordersWithItems = orders.map(order => {
      const items = db.prepare(`
        SELECT oi.*, p.name as product_name 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?
      `).all(order.id);
      return { ...order, items };
    });
    res.json(ordersWithItems);
  });

  app.post("/api/orders", (req, res) => {
    const { customer_name, customer_phone, customer_address, items } = req.body;
    
    const transaction = db.transaction(() => {
      let total_amount = 0;
      items.forEach(item => {
        const product = db.prepare("SELECT price FROM products WHERE id = ?").get(item.product_id);
        total_amount += product.price * item.quantity;
      });

      const orderInfo = db.prepare(`
        INSERT INTO orders (customer_name, customer_phone, customer_address, total_amount)
        VALUES (?, ?, ?, ?)
      `).run(customer_name, customer_phone, customer_address, total_amount);

      const orderId = orderInfo.lastInsertRowid;

      items.forEach(item => {
        const product = db.prepare("SELECT price, cost_price FROM products WHERE id = ?").get(item.product_id);
        db.prepare(`
          INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, cost_at_purchase)
          VALUES (?, ?, ?, ?, ?)
        `).run(orderId, item.product_id, item.quantity, product.price, product.cost_price);
        
        // Update stock
        db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?").run(item.quantity, item.product_id);
      });

      return orderId;
    });

    try {
      const orderId = transaction();
      res.json({ id: orderId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/orders/:id/status", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  // Analytics
  app.get("/api/analytics", (req, res) => {
    const stats = db.prepare(`
      SELECT 
        SUM(total_amount) as total_sales,
        COUNT(id) as total_orders,
        (SELECT SUM(quantity * (price_at_purchase - cost_at_purchase)) FROM order_items JOIN orders ON order_items.order_id = orders.id WHERE orders.status = 'delivered') as total_profit
      FROM orders
      WHERE status = 'delivered'
    `).get();

    const recentSales = db.prepare(`
      SELECT date(created_at) as date, SUM(total_amount) as amount
      FROM orders
      WHERE status = 'delivered'
      GROUP BY date(created_at)
      ORDER BY date DESC
      LIMIT 7
    `).all();

    res.json({
      total_sales: stats.total_sales || 0,
      total_orders: stats.total_orders || 0,
      total_profit: stats.total_profit || 0,
      recentSales
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
