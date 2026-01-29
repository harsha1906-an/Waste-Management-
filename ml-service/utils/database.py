import sqlite3
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import os
import logging

logger = logging.getLogger(__name__)

class DatabaseClient:
    """Client to fetch sales data from backend SQLite database"""
    
    def __init__(self, db_path: str = None):
        if db_path is None:
            # Default to backend database
            backend_path = os.path.join(os.path.dirname(__file__), '..', '..', 'backend')
            db_path = os.path.join(backend_path, 'dev_database.sqlite')
        
        self.db_path = db_path
        logger.info(f"Database path: {self.db_path}")
    
    def get_sales_history(self, product_id: str, days: int = 90) -> List[Dict]:
        """Fetch sales history for a product"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Get sales from last N days
            since_date = (datetime.now() - timedelta(days=days)).isoformat()
            
            query = """
                SELECT 
                    id,
                    productId,
                    quantity,
                    unitPrice,
                    total,
                    soldAt,
                    createdAt
                FROM sales
                WHERE productId = ? AND soldAt >= ?
                ORDER BY soldAt ASC
            """
            
            cursor.execute(query, (product_id, since_date))
            rows = cursor.fetchall()
            
            sales = []
            for row in rows:
                sales.append({
                    'id': row['id'],
                    'productId': row['productId'],
                    'quantity': row['quantity'],
                    'unitPrice': row['unitPrice'],
                    'total': row['total'],
                    'soldAt': row['soldAt'],
                    'createdAt': row['createdAt']
                })
            
            conn.close()
            logger.info(f"Fetched {len(sales)} sales records for product {product_id}")
            
            return sales
        
        except Exception as e:
            logger.error(f"Failed to fetch sales history: {e}")
            return []
    
    def get_product_info(self, product_id: str) -> Optional[Dict]:
        """Fetch product information"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = """
                SELECT 
                    id,
                    vendorId,
                    name,
                    category,
                    quantity,
                    unit,
                    expiryDate
                FROM products
                WHERE id = ?
            """
            
            cursor.execute(query, (product_id,))
            row = cursor.fetchone()
            
            if not row:
                conn.close()
                return None
            
            product = {
                'id': row['id'],
                'vendorId': row['vendorId'],
                'name': row['name'],
                'category': row['category'],
                'quantity': row['quantity'],
                'unit': row['unit'],
                'expiryDate': row['expiryDate']
            }
            
            conn.close()
            return product
        
        except Exception as e:
            logger.error(f"Failed to fetch product info: {e}")
            return None
    
    def get_vendor_products(self, vendor_id: str) -> List[Dict]:
        """Fetch all products for a vendor"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = """
                SELECT 
                    id,
                    name,
                    category,
                    quantity,
                    unit
                FROM products
                WHERE vendorId = ? AND isActive = 1
                ORDER BY name ASC
            """
            
            cursor.execute(query, (vendor_id,))
            rows = cursor.fetchall()
            
            products = []
            for row in rows:
                products.append({
                    'id': row['id'],
                    'name': row['name'],
                    'category': row['category'],
                    'quantity': row['quantity'],
                    'unit': row['unit']
                })
            
            conn.close()
            return products
        
        except Exception as e:
            logger.error(f"Failed to fetch vendor products: {e}")
            return []
