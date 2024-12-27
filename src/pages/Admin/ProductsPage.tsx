import React, { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import axiosInstance from '@/contexts/axiosInstance'
import { toast } from 'sonner'
import { AxiosError } from 'axios'

interface Product {
  id: string
  name: string
  stock: number
  price: number
  createdDate: string
}

interface ResponseBase {
  success: boolean
  message: string
  responseType: 'Success' | 'Error' | 'Warning' | 'Info'
}

interface ApiResponse<T> {
  response: ResponseBase
  data?: T
}

interface PaginatedResponse {
  response: ResponseBase
  products: Product[]
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'createdDate'>>({
    name: '',
    price: 0,
    stock: 0
  })

  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Sayfalanmış ürünleri hesapla
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return products.slice(start, end)
  }, [products, currentPage, pageSize])

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get<PaginatedResponse>('/api/Product/GetProducts')

      console.log('API Response:', response.data) // Debug için eklendi

      if (response.data.response.success) {
        setProducts(response.data.products)
        const totalCount = response.data.products.length
        const calculatedTotalPages = Math.ceil(totalCount / pageSize)
        setTotalPages(calculatedTotalPages)
        setTotalItems(totalCount)
      } else {
        toast.error(response.data.response.message)
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Ürünler getirilirken hata oluştu:', error)
        toast.error(error.response?.data?.message || 'Ürünler yüklenirken bir hata oluştu')
      }
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Sayfa değiştiğinde veya sayfa boyutu değiştiğinde toplam sayfa sayısını güncelle
  useEffect(() => {
    const calculatedTotalPages = Math.ceil(products.length / pageSize)
    setTotalPages(calculatedTotalPages)
  }, [products.length, pageSize])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1) // Sayfa boyutu değiştiğinde ilk sayfaya dön
  }

  const handleAddProduct = async () => {
    try {
      const response = await axiosInstance.post<ApiResponse<void>>('/api/Product/AddProduct', newProduct)
      
      if (response.data.response.success) {
        toast.success(response.data.response.message || 'Ürün başarıyla eklendi')
        setNewProduct({
          name: '',
          price: 0,
          stock: 0
        })
        setIsAddDialogOpen(false)
        fetchProducts()
      } else {
        toast.error(response.data.response.message)
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Ürün eklenirken hata oluştu:', error)
        toast.error(error.response?.data?.message || 'Ürün eklenirken bir hata oluştu')
      }
    }
  }

  const handleEditProduct = async () => {
    if (!editingProduct) return
    try {
      const response = await axiosInstance.post<ApiResponse<void>>('/api/Product/UpdateProduct', editingProduct)
      
      if (response.data.response.success) {
        toast.success(response.data.response.message || 'Ürün başarıyla güncellendi')
        setIsEditDialogOpen(false)
        setEditingProduct(null)
        fetchProducts()
      } else {
        toast.error(response.data.response.message)
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Ürün güncellenirken hata oluştu:', error)
        toast.error(error.response?.data?.message || 'Ürün güncellenirken bir hata oluştu')
      }
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await axiosInstance.delete<ApiResponse<void>>(`/api/Product/DeleteProduct/${id}`)
      
      if (response.data.response.success) {
        toast.success(response.data.response.message || 'Ürün başarıyla silindi')
        fetchProducts()
      } else {
        toast.error(response.data.response.message)
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Ürün silinirken hata oluştu:', error)
        toast.error(error.response?.data?.message || 'Ürün silinirken bir hata oluştu')
      }
    }
  }

  const handleStockUpdate = async (id: string, change: number) => {
    const product = products.find(p => p.id === id)
    if (!product) return

    const updatedProduct = {
      ...product,
      stock: Math.max(0, product.stock + change)
    }

    try {
      const response = await axiosInstance.post<ApiResponse<void>>('/api/Product/UpdateProduct', updatedProduct)
      
      if (response.data.response.success) {
        toast.success(response.data.response.message || 'Stok başarıyla güncellendi')
        fetchProducts()
      } else {
        toast.error(response.data.response.message)
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Stok güncellenirken hata oluştu:', error)
        toast.error(error.response?.data?.message || 'Stok güncellenirken bir hata oluştu')
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Ürün Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Ürünleri ekleyin, düzenleyin ve stok durumlarını yönetin
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Yeni Ürün Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Yeni Ürün Ekle</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Ürün Adı</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price" className="text-gray-700 dark:text-gray-300">Fiyat</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={e => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock" className="text-gray-700 dark:text-gray-300">Stok</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={e => setNewProduct(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleAddProduct}>
                Ekle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-700 dark:text-gray-300">Sayfa başına:</Label>
            <select
              className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Toplam {totalItems} ürün
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 dark:border-gray-700">
              <TableHead className="text-gray-700 dark:text-gray-300">Ürün ID</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Ürün Adı</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300 text-right">Fiyat</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300 text-center">Stok</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300 text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((product) => (
              <TableRow key={product.id} className="border-gray-200 dark:border-gray-700">
                <TableCell className="font-medium text-gray-900 dark:text-white">
                  #{product.id.slice(0, 8)}
                </TableCell>
                <TableCell className="text-gray-800 dark:text-gray-200">{product.name}</TableCell>
                <TableCell className="text-right text-gray-800 dark:text-gray-200">
                  {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-gray-300 dark:border-gray-600"
                      onClick={() => handleStockUpdate(product.id, -1)}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center text-gray-800 dark:text-gray-200">{product.stock}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-gray-300 dark:border-gray-600"
                      onClick={() => handleStockUpdate(product.id, 1)}
                    >
                      +
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-gray-300 dark:border-gray-600"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      {editingProduct && (
                        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-white">Ürün Düzenle</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-name" className="text-gray-700 dark:text-gray-300">Ürün Adı</Label>
                              <Input
                                id="edit-name"
                                value={editingProduct.name}
                                onChange={e => setEditingProduct(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                                className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-price" className="text-gray-700 dark:text-gray-300">Fiyat</Label>
                                <Input
                                  id="edit-price"
                                  type="number"
                                  value={editingProduct.price}
                                  onChange={e => setEditingProduct(prev => prev ? ({ ...prev, price: Number(e.target.value) }) : null)}
                                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-stock" className="text-gray-700 dark:text-gray-300">Stok</Label>
                                <Input
                                  id="edit-stock"
                                  type="number"
                                  value={editingProduct.stock}
                                  onChange={e => setEditingProduct(prev => prev ? ({ ...prev, stock: Number(e.target.value) }) : null)}
                                  className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                              İptal
                            </Button>
                            <Button onClick={handleEditProduct}>
                              Kaydet
                            </Button>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Önceki
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sonraki
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default ProductsPage 