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
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import axiosInstance from '@/contexts/axiosInstance'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AxiosError } from 'axios'
import Swal from 'sweetalert2'

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

  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name')

  // Filtrelenmiş ve sıralanmış ürünleri hesapla
  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOrder === 'asc') {
          return a[sortBy] > b[sortBy] ? 1 : -1
        } else {
          return a[sortBy] < b[sortBy] ? 1 : -1
        }
      })
  }, [products, searchQuery, sortOrder, sortBy])

  // Sayfalanmış ürünleri hesapla
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return filteredAndSortedProducts.slice(start, end)
  }, [filteredAndSortedProducts, currentPage, pageSize])

  // Sayfa değiştiğinde veya sayfa boyutu değiştiğinde toplam sayfa sayısını güncelle
  useEffect(() => {
    const calculatedTotalPages = Math.ceil(filteredAndSortedProducts.length / pageSize)
    setTotalPages(calculatedTotalPages)
    setTotalItems(filteredAndSortedProducts.length)
  }, [filteredAndSortedProducts.length, pageSize])

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  const handleSortByChange = (field: 'name' | 'price' | 'stock') => {
    if (sortBy === field) {
      toggleSortOrder()
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get<PaginatedResponse>('/api/Product/GetProducts')
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1) // Sayfa boyutu değiştiğinde ilk sayfaya dön
  }

  const handleAddProduct = async () => {
    // Validasyon kontrolleri
    if (!newProduct.name.trim()) {
      toast.error('Ürün adı boş bırakılamaz')
      return
    }
    if (newProduct.price <= 0) {
      toast.error('Ürün fiyatı 0\'dan büyük olmalıdır')
      return
    }
    if (newProduct.stock < 0) {
      toast.error('Stok miktarı negatif olamaz')
      return
    }

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

    // Validasyon kontrolleri
    if (!editingProduct.name.trim()) {
      toast.error('Ürün adı boş bırakılamaz')
      return
    }
    if (editingProduct.price <= 0) {
      toast.error('Ürün fiyatı 0\'dan büyük olmalıdır')
      return
    }
    if (editingProduct.stock < 0) {
      toast.error('Stok miktarı negatif olamaz')
      return
    }

    try {
      const updateRequest = {
        productId: editingProduct.id,
        name: editingProduct.name,
        stock: editingProduct.stock,
        price: editingProduct.price
      }
      
      const response = await axiosInstance.post<ApiResponse<void>>('/api/Product/UpdateProduct', updateRequest)
      
      if (response.data.response.success) {
        toast.success(`"${editingProduct.name}" isimli ürün başarıyla güncellendi`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
        setIsEditDialogOpen(false)
        setEditingProduct(null)
        fetchProducts()
      } else {
        toast.error(`Ürün güncellenirken bir hata oluştu: ${response.data.response.message}`)
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Ürün güncellenirken hata oluştu:', error)
        toast.error(`Ürün güncellenirken bir hata oluştu: ${error.response?.data?.message || 'Bilinmeyen bir hata oluştu'}`)
      }
    }
  }

  const handleDeleteProduct = async (id: string) => {
    const productToDelete = products.find(p => p.id === id)
    if (!productToDelete) return

    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu ürünü silmek istediğinize emin misiniz?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'İptal'
    })

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.delete<ApiResponse<void>>('/api/Product/DeleteProduct', {
          data: { id }
        })
        
        if (response.data.response.success) {
          toast.success(`"${productToDelete.name}" isimli ürün başarıyla silindi`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          })
          fetchProducts()
        } else {
          toast.error(`Ürün silinirken bir hata oluştu: ${response.data.response.message}`)
        }
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.error('Ürün silinirken hata oluştu:', error)
          toast.error(`Ürün silinirken bir hata oluştu: ${error.response?.data?.message || 'Bilinmeyen bir hata oluştu'}`)
        }
      }
    }
  }

  const handleStockUpdate = async (id: string, change: number) => {
    const product = products.find(p => p.id === id)
    if (!product) return

    const newStock = Math.max(0, product.stock + change)
    const updateRequest = {
      productId: product.id,
      name: product.name,
      stock: newStock,
      price: product.price
    }

    try {
      const response = await axiosInstance.post<ApiResponse<void>>('/api/Product/UpdateProduct', updateRequest)
      
      if (response.data.response.success) {
        const action = change > 0 ? 'artırıldı' : 'azaltıldı'
        toast.success(`"${product.name}" ürününün stok miktarı ${Math.abs(change)} adet ${action} (${product.stock} → ${newStock})`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
        fetchProducts()
      } else {
        toast.error(`Stok güncellenirken bir hata oluştu: ${response.data.response.message}`)
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Stok güncellenirken hata oluştu:', error)
        toast.error(`Stok güncellenirken bir hata oluştu: ${error.response?.data?.message || 'Bilinmeyen bir hata oluştu'}`)
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Ürünler
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              onClick={toggleSortOrder}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M3.5 5.5L7.5 9.5L11.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
              <select
                className="bg-transparent border-none text-sm focus:outline-none text-gray-900 dark:text-gray-100"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                <option value={5}>5 satır</option>
                <option value={10}>10 satır</option>
                <option value={20}>20 satır</option>
                <option value={50}>50 satır</option>
              </select>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                / {totalItems} kayıt
              </span>
            </div>
          </div>
          
          <div className="relative">
            <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              type="search"
              placeholder="Ürün Ara"
              className="pl-9 w-[250px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
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

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Ürün Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Yeni Ürün Ekle</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-300">
                  Yeni bir ürün eklemek için aşağıdaki formu doldurun.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Ürün Adı</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
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
                      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stock" className="text-gray-700 dark:text-gray-300">Stok</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={e => setNewProduct(prev => ({ ...prev, stock: Number(e.target.value) }))}
                      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                >
                  İptal
                </Button>
                <Button onClick={handleAddProduct}>
                  Ekle
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Ürün Düzenle</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Ürün bilgilerini güncellemek için aşağıdaki formu düzenleyin.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name" className="text-gray-700 dark:text-gray-300">Ürün Adı</Label>
                  <Input
                    id="edit-name"
                    value={editingProduct.name}
                    onChange={e => setEditingProduct(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
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
                      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-stock" className="text-gray-700 dark:text-gray-300">Stok</Label>
                    <Input
                      id="edit-stock"
                      type="number"
                      value={editingProduct.stock}
                      onChange={e => setEditingProduct(prev => prev ? ({ ...prev, stock: Number(e.target.value) }) : null)}
                      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                >
                  İptal
                </Button>
                <Button onClick={handleEditProduct}>
                  Kaydet
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 dark:border-gray-700 hover:bg-transparent">
              <TableHead 
                className="text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer"
                onClick={() => handleSortByChange('name')}
              >
                <div className="flex items-center gap-2">
                  Ürün Adı
                  {sortBy === 'name' && (
                    <svg className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer"
                onClick={() => handleSortByChange('price')}
              >
                <div className="flex items-center gap-2">
                  Fiyat
                  {sortBy === 'price' && (
                    <svg className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer"
                onClick={() => handleSortByChange('stock')}
              >
                <div className="flex items-center gap-2">
                  Stok
                  {sortBy === 'stock' && (
                    <svg className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
              </TableHead>
              <TableHead className="text-xs font-medium text-gray-600 dark:text-gray-300 text-center">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts.map((product) => (
              <TableRow 
                key={product.id} 
                className="border-gray-200 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        #{product.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white font-medium">
                  {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700"
                      onClick={() => handleStockUpdate(product.id, -1)}
                    >
                      -
                    </Button>
                    <span className="min-w-[40px] text-center font-medium text-gray-900 dark:text-white">
                      {product.stock}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 hover:border-green-300 dark:hover:border-green-700"
                      onClick={() => handleStockUpdate(product.id, 1)}
                    >
                      +
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 hover:border-blue-300 dark:hover:border-blue-700 rounded-md px-4"
                      onClick={() => {
                        setEditingProduct(product)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 hover:border-red-300 dark:hover:border-red-700 rounded-md px-4"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Sil
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Sayfa {currentPage} / {totalPages}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProductsPage 