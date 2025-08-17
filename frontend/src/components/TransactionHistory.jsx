import { useState, useEffect } from 'react'
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Spinner, 
  Alert, 
  AlertIcon,
  Button,
  useToast,
  Flex,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

const TransactionHistory = ({ onBalanceUpdate }) => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deletingId, setDeletingId] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  const toast = useToast()

  const fetchTransactions = async (pageNum = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/transactions/${user.id}?page=${pageNum}&limit=10`)
      const data = await response.json()
      
      if (data.success) {
        setTransactions(data.data.transactions)
        setTotalPages(data.data.totalPages)
        setError(null)
      } else {
        setError(data.message || 'Failed to fetch transactions')
      }
    } catch (error) {
      setError('Could not load transactions')
      toast({
        title: 'Error',
        description: 'Could not load transaction history',
        status: 'error',
        duration: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
  }, [user])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionColor = (type) => {
    return type === 'income' ? 'green.500' : 'red.500'
  }

  const getTransactionSign = (type) => {
    return type === 'income' ? '+' : '-'
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    fetchTransactions(newPage)
  }

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction)
    onOpen()
  }

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return

    try {
      setDeletingId(transactionToDelete._id)
      const response = await fetch(`http://localhost:5000/api/transactions/${user.id}/${transactionToDelete._id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        // Update transactions list
        setTransactions(transactions.filter(t => t._id !== transactionToDelete._id))
        
        // Update parent component's balance
        if (onBalanceUpdate) {
          onBalanceUpdate(data.data.newBalance)
        }

        toast({
          title: 'Success',
          description: 'Transaction deleted successfully',
          status: 'success',
          duration: 3000
        })
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Could not delete transaction',
          status: 'error',
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not delete transaction',
        status: 'error',
        duration: 3000
      })
    } finally {
      setDeletingId(null)
      setTransactionToDelete(null)
      onClose()
    }
  }

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4}>Loading transactions...</Text>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  if (transactions.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500" fontSize="lg">
          No transactions found
        </Text>
        <Text color="gray.400" fontSize="sm" mt={2}>
          Add your first income or expense to get started!
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold" mb={6}>
        Transaction History
      </Text>
      
      <VStack spacing={3} align="stretch">
        {transactions.map((transaction) => (
          <Box
            key={transaction._id}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            bg="white"
            borderColor="gray.200"
            _hover={{ borderColor: "gray.300", shadow: "sm" }}
            transition="all 0.2s"
          >
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1} flex={1}>
                <Text fontWeight="medium" color="gray.800" fontSize="md">
                  {transaction.category}
                </Text>
                
                <Text fontSize="sm" color="gray.500">
                  {formatDate(transaction.date)}
                </Text>
              </VStack>

              <HStack align="center" spacing={3}>
                <VStack align="end" spacing={1}>
                  <HStack align="center">
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color={getTransactionColor(transaction.type)}
                      minWidth="20px"
                      textAlign="center"
                    >
                      {getTransactionSign(transaction.type)}
                    </Text>
                    <Text
                      fontSize="xl"
                      fontWeight="bold"
                      color={getTransactionColor(transaction.type)}
                    >
                      ৳{transaction.amount.toFixed(2)}
                    </Text>
                  </HStack>
                </VStack>

                <IconButton
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  aria-label="Delete transaction"
                  icon={<Text fontSize="sm" fontWeight="bold">×</Text>}
                  onClick={() => handleDeleteClick(transaction)}
                  isLoading={deletingId === transaction._id}
                />
              </HStack>
            </Flex>
          </Box>
        ))}
      </VStack>

      {totalPages > 1 && (
        <Flex justify="center" mt={8} gap={2}>
          <Button
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            isDisabled={page === 1}
          >
            Previous
          </Button>
          
          <HStack spacing={2}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }
              
              return (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={page === pageNum ? 'solid' : 'outline'}
                  colorScheme={page === pageNum ? 'blue' : 'gray'}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </HStack>
          
          <Button
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            isDisabled={page === totalPages}
          >
            Next
          </Button>
        </Flex>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Transaction
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this transaction?
              <br />
              <strong>{transactionToDelete?.category}</strong> - ৳{transactionToDelete?.amount.toFixed(2)}
              <br />
              <Text fontSize="sm" color="gray.500" mt={2}>
                This will also update your balance accordingly.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default TransactionHistory
