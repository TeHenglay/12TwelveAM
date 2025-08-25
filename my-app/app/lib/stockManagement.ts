import prisma from './db';

export interface StockUpdateItem {
  productId: string;
  size: string;
  quantity: number;
}

export async function reduceStock(items: StockUpdateItem[]): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  try {
    // Start a transaction to ensure all stock updates succeed or fail together
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        // Find the product size
        const productSize = await tx.productSize.findUnique({
          where: {
            productId_size: {
              productId: item.productId,
              size: item.size
            }
          },
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        });

        if (!productSize) {
          throw new Error(`Product size ${item.size} not found for product ${item.productId}`);
        }

        // Check if we have enough stock
        const availableStock = productSize.stock - productSize.reservedStock;
        if (availableStock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${productSize.product.name} (${item.size}). ` +
            `Available: ${availableStock}, Requested: ${item.quantity}`
          );
        }

        // Reduce the stock
        await tx.productSize.update({
          where: {
            productId_size: {
              productId: item.productId,
              size: item.size
            }
          },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });

        console.log(
          `Stock reduced: ${productSize.product.name} (${item.size}) - ${item.quantity} units. ` +
          `New stock: ${productSize.stock - item.quantity}`
        );
      }
    });

    return { success: true, errors: [] };
  } catch (error) {
    console.error('Error reducing stock:', error);
    return { 
      success: false, 
      errors: [(error as Error).message] 
    };
  }
}

export async function restoreStock(items: StockUpdateItem[]): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  try {
    // Start a transaction to ensure all stock updates succeed or fail together
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        // Find the product size
        const productSize = await tx.productSize.findUnique({
          where: {
            productId_size: {
              productId: item.productId,
              size: item.size
            }
          },
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        });

        if (!productSize) {
          throw new Error(`Product size ${item.size} not found for product ${item.productId}`);
        }

        // Restore the stock
        await tx.productSize.update({
          where: {
            productId_size: {
              productId: item.productId,
              size: item.size
            }
          },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });

        console.log(
          `Stock restored: ${productSize.product.name} (${item.size}) + ${item.quantity} units. ` +
          `New stock: ${productSize.stock + item.quantity}`
        );
      }
    });

    return { success: true, errors: [] };
  } catch (error) {
    console.error('Error restoring stock:', error);
    return { 
      success: false, 
      errors: [(error as Error).message] 
    };
  }
}

export async function checkStockAvailability(items: StockUpdateItem[]): Promise<{ 
  available: boolean; 
  errors: string[] 
}> {
  const errors: string[] = [];
  
  try {
    for (const item of items) {
      const productSize = await prisma.productSize.findUnique({
        where: {
          productId_size: {
            productId: item.productId,
            size: item.size
          }
        },
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      });

      if (!productSize) {
        errors.push(`Product size ${item.size} not found for product ${item.productId}`);
        continue;
      }

      const availableStock = productSize.stock - productSize.reservedStock;
      if (availableStock < item.quantity) {
        errors.push(
          `Insufficient stock for ${productSize.product.name} (${item.size}). ` +
          `Available: ${availableStock}, Requested: ${item.quantity}`
        );
      }
    }

    return { 
      available: errors.length === 0, 
      errors 
    };
  } catch (error) {
    console.error('Error checking stock availability:', error);
    return { 
      available: false, 
      errors: [(error as Error).message] 
    };
  }
}
