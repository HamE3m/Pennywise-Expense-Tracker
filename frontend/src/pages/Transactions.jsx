import { useEffect, useState } from 'react'
import {Container, Box, Text, VStack, HStack, Button, FormControl, FormLabel, Input, useToast, Textarea, Grid, GridItem, Select} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import TransactionHistory from '../components/TransactionHistory'

const Transactions = () => {
  const { user } = useAuth()
  const [incomeAmount, setIncomeAmount] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [incomeDescription, setIncomeDescription] = useState('')
  const [expenseDescription, setExpenseDescription] = useState('')
  const [expenseCategory, setExpenseCategory] = useState('')
  const [balance, setBalance] = useState(user?.balance || 0)
  const [refreshHistory, setRefreshHistory] = useState(0)
  const toast = useToast()

  // Expense categories
  const expenseCategories = ['Rent', 'Food', 'Travel', 'Groceries', 'Shopping', 'Others']

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/user/${user.id}`)
        const data = await response.json()
        if (data.success) {
          setBalance(data.data.balance || 0)
        }
      } catch (error) {
        toast({title: 'Error', description: 'Could not fetch balance', status: 'error', duration: 3000})
      }
    }

    if (user) {
      fetchBalance()
    }
  }, [user, toast])

  const handleTransaction = async (type, amount, description, category = null) => {
    if (!amount) {
      toast({
        title: 'Error', 
        description: 'Please enter an amount', 
        status: 'error', 
        duration: 3000
      })
      return
    }

    // For expenses, require category selection
    if (type === 'expense' && !category) {
      toast({
        title: 'Error', 
        description: 'Please select a category for the expense', 
        status: 'error', 
        duration: 3000
      })
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${user.id}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          amount: Number(amount), 
          type: type,
          category: type === 'expense' ? category : (description.trim() || 'Income'), // Use category for expenses, description for income
          description: description.trim()
        }),
      })
      const data = await response.json()
      
      if (data.success) {
        setBalance(data.data.newBalance)
        
        // Clear the appropriate form
        if (type === 'income') {
          setIncomeAmount('')
          setIncomeDescription('')
        } else {
          setExpenseAmount('')
          setExpenseDescription('')
          setExpenseCategory('')
        }
        
        setRefreshHistory(prev => prev + 1) // Trigger history refresh
        toast({
          title: `${type === 'income' ? 'Income' : 'Expense'} added successfully`, 
          status: 'success', 
          duration: 3000
        })
      } else {
        toast({
          title: 'Error', 
          description: data.message || 'Could not add transaction', 
          status: 'error', 
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        title: 'Error', 
        description: 'Could not add transaction', 
        status: 'error', 
        duration: 3000
      })
    }
  }

  return (
    <Container maxW="container.lg" py={8}>
      {/* Current Balance Display */}
      <Box 
        w="full" 
        p={6} 
        bg="blue.500" 
        color="white" 
        borderRadius="lg" 
        mb={8}
        textAlign="center"
      >
        <Text fontSize="lg" mb={2}>Current Balance</Text>
        <Text fontSize="4xl" fontWeight="bold">
          ৳{balance.toFixed(2)}
        </Text>
      </Box>

      {/* Add Income and Expense Side by Side */}
      <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={8}>
        {/* Add Income */}
        <GridItem>
          <Box borderWidth="1px" borderColor="gray.200" borderRadius="lg" p={6} bg="white">
            <VStack spacing={4} align="stretch">
              <Text fontSize="2xl" fontWeight="bold" color="gray.800" textAlign="center">
                Add Income
              </Text>
              
              <FormControl isRequired>
                <FormLabel color="gray.600">Amount (৳)</FormLabel>
                <Input
                  type="number"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  bg="white"
                  focusBorderColor="blue.500"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="gray.600">Description</FormLabel>
                <Textarea
                  value={incomeDescription}
                  onChange={(e) => setIncomeDescription(e.target.value)}
                  resize="none"
                  rows={3}
                  bg="white"
                  focusBorderColor="blue.500"
                />
              </FormControl>
              
              <Button 
                colorScheme="green" 
                size="lg"
                onClick={() => handleTransaction('income', incomeAmount, incomeDescription)}
                isDisabled={!incomeAmount}
              >
                + Add Income
              </Button>
            </VStack>
          </Box>
        </GridItem>

        {/* Add Expense */}
        <GridItem>
          <Box borderWidth="1px" borderColor="gray.200" borderRadius="lg" p={6} bg="white">
            <VStack spacing={4} align="stretch">
              <Text fontSize="2xl" fontWeight="bold" color="gray.800" textAlign="center">
                Add Expense
              </Text>
              
              <FormControl isRequired>
                <FormLabel color="gray.600">Amount (৳)</FormLabel>
                <Input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  bg="white"
                  focusBorderColor="blue.500"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.600">Category</FormLabel>
                <Select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  placeholder="Select expense category"
                  bg="white"
                  focusBorderColor="blue.500"
                >
                  {expenseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color="gray.600">Description</FormLabel>
                <Textarea
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  resize="none"
                  rows={3}
                  bg="white"
                  focusBorderColor="blue.500"
                />
              </FormControl>
              
              <Button 
                colorScheme="red" 
                size="lg"
                onClick={() => handleTransaction('expense', expenseAmount, expenseDescription, expenseCategory)}
                isDisabled={!expenseAmount || !expenseCategory}
              >
                - Add Expense
              </Button>
            </VStack>
          </Box>
        </GridItem>
      </Grid>

      {/* Transaction History */}
      <Box>
        <TransactionHistory 
          key={refreshHistory} 
          onBalanceUpdate={(newBalance) => setBalance(newBalance)} 
        />
      </Box>
    </Container>
  )
}

export default Transactions