import { useEffect, useState } from 'react'
import {Container, Box, Text, VStack, Button, FormControl, FormLabel, Input, useToast, Tabs, TabList, TabPanels, Tab, TabPanel} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

const Transactions = () => {
  const { user } = useAuth()
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState(user?.balance || 0)
  const toast = useToast()

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/user/${user._id}`)
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

  const handleTransaction = async (type) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/${user._id}/balance`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({amount: Number(amount), type: type}),
      })
      const data = await response.json()
      
      if (data.success) {
        setBalance(data.balance)
        setAmount('')
        toast({title: `${type === 'income' ? 'Income' : 'Expense'} added successfully`, status: 'success', duration: 3000})
      } else {
        toast({title: 'Error', description: data.message || 'Could not update balance', status: 'error', duration: 3000})
      }
    } catch (error) {
      toast({title: 'Error', description: 'Could not update balance', status: 'error', duration: 3000})
    }
  }

  return (
    <Container maxW="container.md" py={8}>
      <Box 
        w="full" 
        p={4} 
        bg="blue.500" 
        color="white" 
        borderRadius="lg" 
        mb={8}
      >
        <VStack>
          <Text fontSize="lg">Current Balance</Text>
          <Text fontSize="3xl" fontWeight="bold">
            ৳{balance.toFixed(2)}
          </Text>
        </VStack>
      </Box>

      <Tabs isFitted variant="enclosed">
        <TabList mb="1em">
          <Tab>Income</Tab>
          <Tab>Expense</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box borderWidth="1px" borderRadius="lg" p={8}>
              <VStack spacing={4} align="stretch">
                <Text fontSize="2xl" fontWeight="bold">Add Income</Text>
                <FormControl>
                  <FormLabel>Amount (৳)</FormLabel>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </FormControl>
                <Button 
                  colorScheme="green" 
                  onClick={() => handleTransaction('income')}
                >
                  Add Income
                </Button>
              </VStack>
            </Box>
          </TabPanel>
          <TabPanel>
            <Box borderWidth="1px" borderRadius="lg" p={8}>
              <VStack spacing={4} align="stretch">
                <Text fontSize="2xl" fontWeight="bold">Add Expense</Text>
                <FormControl>
                  <FormLabel>Amount (৳)</FormLabel>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </FormControl>
                <Button 
                  colorScheme="red" 
                  onClick={() => handleTransaction('expense')}
                >
                  Add Expense
                </Button>
              </VStack>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  )
}

export default Transactions