const ProductService = require('../services/product.service')
const { getListProductWithCache, setProductsCache } = require('../services/redis.service')
const redisClient = require('../dbs/redis')

class productController {
    createProduct = async (req, res) => {

        const productData = req.body;
    
        const thumbnail = req.files['thumbnail']
            ? req.files['thumbnail'][0].filename
            : '';
        const images = req.files['images']
            ? req.files['images'].map((file) => file.filename)
            : [];
    
        productData.thumbnail = thumbnail;
        productData.images = images;
        try {
            const productCreate = await ProductService.createProduct(productData)
            res.send(productCreate)
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    }

    // createProductEdit = async (req, res) => {
    //     const productData = req.body

    //     try {
    //         const productCreate = await ProductService.createProduct(productData)
    //         res.send(productCreate)
    //     } catch (error) {
    //         return res.status(400).json({ error: error.message })
    //     }
    // }

    createProducts = async (req, res) => {
        const productsData = req.body;
        try {
            const productsCreated = await ProductService.createProducts(productsData);
            res.send(productsCreated);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    getAllProduct = async (req, res) => {
        try {
            const allProductCache = await getListProductWithCache()
            if (allProductCache) {
                return res.send(allProductCache)
            }

            const allProduct = await ProductService.getAllProduct()
            await setProductsCache(allProduct)
            return res.send(allProduct)
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    }

    // getProduct = async (req, res) => {
    //     const qCategory = req.query.category;
    //     const page = parseInt(req.query.page) - 1 || 0;
    //     const limit = parseInt(req.query.limit) || 6;
    //     const search = req.query.search || "";
    //     const sex = req.query.sex || "";
    //     const brand = req.query.brand || "";
    //     const country = req.query.country || "";
    //     const sortField = req.query.sortField || "price";
    //     const priceFrom = req.query.priceFrom || "";
    //     const priceTo = req.query.priceTo || "";
    //     try {
    //         const Products = await ProductService.getProduct(page, limit, qCategory, search, sex, brand, country, sortField, priceFrom, priceTo)

    //         return res.send(Products)
    //     } catch (error) {
    //         return res.status(400).json({ error: error.message })
    //     }
    // }

    getProduct = async (req, res) => {
        const qCategory = req.query.category;
        const page = parseInt(req.query.page, 10) - 1 || 0;
        const limit = parseInt(req.query.limit, 10) || 9;
        const search = req.query.search || "";
        const sex = req.query.sex || "";
        const brand = req.query.brand || "";
        const country = req.query.country || "";
        const sortField = req.query.sortField || "price";
        const priceFrom = req.query.priceFrom || "";
        const priceTo = req.query.priceTo || "";

        const cacheKey = `products:${qCategory}:${page}:${limit}:${search}:${sex}:${brand}:${country}:${sortField}:${priceFrom}:${priceTo}`;

        try {
            // const cachedData = await redisClient.get(cacheKey);

            // if (cachedData) {
            //     return res.send(JSON.parse(cachedData));
            // }

            const allProduct = await ProductService.getProduct(page, limit, qCategory, search, sex, brand, country, sortField, priceFrom, priceTo);

            // await redisClient.setEx(cacheKey, 3600, JSON.stringify(allProduct));

            return res.send(allProduct);
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ error: error.message });
        }
    };

    updateProduct = async (req, res) => {
        const productID = req.params.id
        const updateData = req.body
        try {
            const updatedProduct = await ProductService.updateProduct(productID, updateData)
            res.send(updatedProduct)
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    }

    deleteProduct = async (req, res) => {
        const productID = req.params.id
        try {
            const deletedProduct = await ProductService.deleteProduct(productID)
            res.send(deletedProduct)
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    }

    getOneProduct = async (req, res) => {
        const productID = req.params.id
        try {
            const detailsProduct = await ProductService.getOneProduct(productID)
            res.send(detailsProduct)
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    }
}

module.exports = new productController()