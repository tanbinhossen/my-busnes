import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // API Routes
  
  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const { name, description, price, cost_price, image_url, category, stock } = req.body;
      
      if (!name || price === undefined || cost_price === undefined) {
        return res.status(400).json({ error: "Name, price, and cost price are required" });
      }

      const { data, error } = await supabase
        .from("products")
        .insert([{ 
          name, 
          description: description || "", 
          price, 
          cost_price, 
          image_url: image_url || "", 
          category: category || "", 
          stock: stock || 0 
        }])
        .select();
      
      if (error) throw error;
      res.json({ id: data[0].id });
    } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { name, description, price, cost_price, image_url, category, stock } = req.body;
      const { id } = req.params;

      const { error } = await supabase
        .from("products")
        .update({ name, description, price, cost_price, image_url, category, stock })
        .eq("id", id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", req.params.id);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const { data: orders, error: orderError } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name))")
        .order("created_at", { ascending: false });

      if (orderError) throw orderError;

      // Transform data to match frontend expectations
      const formattedOrders = orders.map(order => ({
        ...order,
        items: order.order_items.map(item => ({
          ...item,
          product_name: item.products?.name || "Unknown Product"
        }))
      }));

      res.json(formattedOrders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    const { customer_name, customer_phone, customer_address, items } = req.body;
    
    try {
      // 1. Calculate total and get product details
      let total_amount = 0;
      const productIds = items.map(i => i.product_id);
      const { data: products, error: pError } = await supabase
        .from("products")
        .select("id, price, cost_price, stock")
        .in("id", productIds);

      if (pError) throw pError;

      const productMap = new Map(products.map(p => [p.id, p]));
      
      items.forEach(item => {
        const p = productMap.get(item.product_id);
        if (p) total_amount += p.price * item.quantity;
      });

      // 2. Create Order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{ customer_name, customer_phone, customer_address, total_amount }])
        .select();

      if (orderError) throw orderError;
      const orderId = orderData[0].id;

      // 3. Create Order Items & Update Stock
      const orderItems = items.map(item => {
        const p = productMap.get(item.product_id);
        return {
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: p?.price || 0,
          cost_at_purchase: p?.cost_price || 0
        };
      });

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // Update stock for each product
      for (const item of items) {
        const p = productMap.get(item.product_id);
        if (p) {
          await supabase
            .from("products")
            .update({ stock: p.stock - item.quantity })
            .eq("id", item.product_id);
        }
      }

      res.json({ id: orderId });
    } catch (error) {
      console.error("Order error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    const { status } = req.body;
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", req.params.id);
      
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      // Get all delivered orders
      const { data: orders, error: oError } = await supabase
        .from("orders")
        .select("total_amount, created_at, order_items(quantity, price_at_purchase, cost_at_purchase)")
        .eq("status", "delivered");

      if (oError) throw oError;

      let total_sales = 0;
      let total_profit = 0;
      const salesByDate = new Map();

      orders.forEach(order => {
        total_sales += order.total_amount;
        let orderProfit = 0;
        order.order_items.forEach(item => {
          orderProfit += item.quantity * (item.price_at_purchase - item.cost_at_purchase);
        });
        total_profit += orderProfit;

        const date = new Date(order.created_at).toISOString().split('T')[0];
        const existing = salesByDate.get(date) || { date, orders_count: 0, sales_amount: 0, profit_amount: 0 };
        existing.orders_count += 1;
        existing.sales_amount += order.total_amount;
        existing.profit_amount += orderProfit;
        salesByDate.set(date, existing);
      });

      const recentSales = Array.from(salesByDate.values())
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 7);

      res.json({
        total_sales,
        total_orders: orders.length,
        total_profit,
        recentSales
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
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
