import {useEffect, useState} from 'react'
import {Container, Box, Text, VStack, HStack, Button, FormControl, FormLabel, Input, useToast, Textarea, Grid, GridItem, Select} from '@chakra-ui/react'
import {useAuth} from '../context/AuthContext'
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
      toast({title: 'Error', description: 'Please enter an amount', status: 'error', duration: 3000})
      return
    }
    if (type === 'expense' && !category) {
      toast({title: 'Error', description: 'Please select a category for the expense', status: 'error', duration: 3000})
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
        if (type === 'income') {
          setIncomeAmount('')
          setIncomeDescription('')
        } else {
          setExpenseAmount('')
          setExpenseDescription('')
          setExpenseCategory('')
        }      
        setRefreshHistory(prev => prev + 1)
        toast({title: `${type === 'income' ? 'Income' : 'Expense'} added successfully`, status: 'success', duration: 3000})
      } else {
        toast({title: 'Error', description: data.message || 'Could not add transaction', status: 'error', duration: 3000})
      }
    } catch (error) {
      toast({title: 'Error', description: 'Could not add transaction', status: 'error', duration: 3000})
    }
  }
  return (
    <Box 
      minH="100vh" 
      bgGradient="linear(to-t, #1C495E, #17694D)"
      fontFamily="'Roboto', sans-serif"
    >
      <Container maxW="container.lg" py={8}>
      <Box 
        w="full" 
        p={2} 
        bg="white" 
        color="gray.800" 
        borderRadius="xl" 
        borderWidth="1px"
        borderColor="gray.200"
        shadow="sm"
        mb={8}
        textAlign="center"
      >
        <Text fontSize="md" mb={1} color="gray.600" fontFamily="'Roboto', sans-serif">Current Balance</Text>
        <Text 
          fontSize="3xl" 
          fontWeight="bold" 
          bgGradient="linear(to-t, #1C495E, #17694D)"
          bgClip="text"
        >
          ৳{balance.toFixed(2)}
        </Text>
      </Box>
      <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={8}>
        <GridItem>
          <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={6} bg="white" shadow="sm" height="460px">
            <VStack spacing={4} align="stretch" height="100%" justify="space-between">
              <Text fontSize="2xl" fontWeight="bold" color="gray.800" textAlign="center" fontFamily="'Roboto', sans-serif">
                Add Income
              </Text>      
              <VStack spacing={4} align="stretch" flex="1">
                <FormControl isRequired>
                  <FormLabel color="gray.600" fontFamily="'Roboto', sans-serif">Amount (৳)</FormLabel>
                  <Input
                    type="number"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(e.target.value)}
                    bg="white"
                    focusBorderColor="blue.500"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="gray.600" fontFamily="'Roboto', sans-serif">Description</FormLabel>
                  <Textarea
                    value={incomeDescription}
                    onChange={(e) => setIncomeDescription(e.target.value)}
                    resize="none"
                    rows={7}
                    bg="white"
                    focusBorderColor="blue.500"
                  />
                </FormControl>
              </VStack>            
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
        <GridItem>
          <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={6} bg="white" shadow="sm" height="460px">
            <VStack spacing={4} align="stretch" height="100%" justify="space-between">
              <Text fontSize="2xl" fontWeight="bold" color="gray.800" textAlign="center" fontFamily="'Roboto', sans-serif">
                Add Expense
              </Text>              
              <VStack spacing={4} align="stretch" flex="1">
                <FormControl isRequired>
                  <FormLabel color="gray.600" fontFamily="'Roboto', sans-serif">Amount (৳)</FormLabel>
                  <Input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    bg="white"
                    focusBorderColor="blue.500"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color="gray.600" fontFamily="'Roboto', sans-serif">Category</FormLabel>
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
                  <FormLabel color="gray.600" fontFamily="'Roboto', sans-serif">Description</FormLabel>
                  <Textarea
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    resize="none"
                    rows={3}
                    bg="white"
                    focusBorderColor="blue.500"
                  />
                </FormControl>
              </VStack>              
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
      <Box 
        p={6} 
        borderWidth="1px" 
        borderRadius="xl" 
        bg="white" 
        borderColor="gray.200" 
        shadow="sm"
      >
        <TransactionHistory 
          key={refreshHistory} 
          onBalanceUpdate={(newBalance) => setBalance(newBalance)} 
        />
      </Box>
    </Container>
    </Box>
  )
}

export default Transactions