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
import { Plus, Wallet } from 'lucide-react'

const WalletPage = () => {
  const transactions = [
    {
      id: 1,
      date: '2024-03-17',
      type: 'Yükleme',
      amount: 1000,
      balance: 2500
    },
    {
      id: 2,
      date: '2024-03-16',
      type: 'Sipariş Ödemesi',
      amount: -750,
      balance: 1500
    },
    {
      id: 3,
      date: '2024-03-15',
      type: 'Yükleme',
      amount: 2000,
      balance: 2250
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cüzdan</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Bakiye Yükle
        </Button>
      </div>

      <Card className="p-6 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-4">
          <Wallet className="h-12 w-12 text-primary dark:text-blue-400" />
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Mevcut Bakiye
            </p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              ₺2,500.00
            </h2>
          </div>
        </div>
      </Card>

      <Card className="bg-white dark:bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 dark:border-gray-700">
              <TableHead className="text-gray-700 dark:text-gray-300">Tarih</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">İşlem</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Tutar</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Bakiye</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} className="border-gray-200 dark:border-gray-700">
                <TableCell className="text-gray-900 dark:text-white">{transaction.date}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">{transaction.type}</TableCell>
                <TableCell className={transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {transaction.amount > 0 ? '+' : ''}₺{transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white">₺{transaction.balance.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

export default WalletPage 