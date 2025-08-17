import { useState, useEffect } from 'react'
import {
  Container,
  Box,
  Text,
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Grid,
  GridItem,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Divider
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import MonthlyTransactionHistory from '../components/MonthlyTransactionHistory'

const Budget = () => {
  const { user } = useAuth()
  const [budget, setBudget] = useState(null)
  const [budgetAmount, setBudgetAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const currentDate = new Date()
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' })
  const currentYear = currentDate.getFullYear()

  // Fetch current budget
  const fetchBudget = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/budget/${user.id}`)
      const data = await response.json()

      if (data.success) {
        setBudget(data.data)
        setBudgetAmount(data.data.totalBudget.toString())
      } else {
        toast({
          title: 'Error',
          description: 'Could not load budget',
          status: 'error',
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not load budget',
        status: 'error',
        duration: 3000
      })
    } finally {
      setLoading(false)
    }
  }

  // Update budget
  const updateBudget = async () => {
    if (!budgetAmount || parseFloat(budgetAmount) < 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid budget amount',
        status: 'error',
        duration: 3000
      })
      return
    }

    try {
      setUpdating(true)
      
      console.log('Sending budget update request:', {
        userId: user.id,
        totalBudget: parseFloat(budgetAmount),
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
      })

      const response = await fetch(`http://localhost:5000/api/budget/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalBudget: parseFloat(budgetAmount),
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear()
        })
      })

      const data = await response.json()
      console.log('Budget update response:', data)
      
      if (data.success) {
        setBudget(data.data)
        onClose()
        toast({
          title: 'Success',
          description: 'Budget updated successfully',
          status: 'success',
          duration: 3000
        })
      } else {
        console.error('Budget update failed:', data)
        toast({
          title: 'Error',
          description: data.message || 'Could not update budget',
          status: 'error',
          duration: 3000
        })
      }
    } catch (error) {
      console.error('Budget update error:', error)
      toast({
        title: 'Error',
        description: 'Could not update budget',
        status: 'error',
        duration: 3000
      })
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchBudget()
    }
  }, [user])

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'red'
    if (percentage >= 70) return 'orange'
    return 'green'
  }

  const getBudgetStatus = () => {
    if (!budget || budget.totalBudget === 0) return 'No budget set'
    
    const percentage = (budget.spentAmount / budget.totalBudget) * 100
    if (percentage >= 100) return 'Budget exceeded!'
    if (percentage >= 90) return 'Nearly exceeded'
    if (percentage >= 70) return 'Be careful'
    return 'On track'
  }

  if (loading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Text textAlign="center">Loading budget...</Text>
      </Container>
    )
  }

  const budgetPercentage = budget && budget.totalBudget > 0 
    ? (budget.spentAmount / budget.totalBudget) * 100 
    : 0

  return (
    <Container maxW="container.lg" py={8}>
      {/* Header */}
      <Box textAlign="center" mb={8}>
        <Text fontSize="3xl" fontWeight="bold" color="gray.800">
          Monthly Budget
        </Text>
        <Text fontSize="lg" color="gray.600">
          {currentMonthName} {currentYear}
        </Text>
      </Box>

      {/* Budget Overview */}
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6} mb={8}>
        <GridItem>
          <Stat p={6} borderWidth="1px" borderRadius="lg" bg="white" borderColor="gray.200">
            <StatLabel color="gray.600">Total Budget</StatLabel>
            <StatNumber color="gray.800">৳{budget?.totalBudget?.toFixed(2) || '0.00'}</StatNumber>
            <StatHelpText color="gray.600">
              Monthly allocation
            </StatHelpText>
          </Stat>
        </GridItem>

        <GridItem>
          <Stat p={6} borderWidth="1px" borderRadius="lg" bg="white" borderColor="gray.200">
            <StatLabel color="gray.600">Spent Amount</StatLabel>
            <StatNumber color="gray.800">৳{budget?.spentAmount?.toFixed(2) || '0.00'}</StatNumber>
            <StatHelpText color="gray.600">
              This month's expenses
            </StatHelpText>
          </Stat>
        </GridItem>

        <GridItem>
          <Stat p={6} borderWidth="1px" borderRadius="lg" bg="white" borderColor="gray.200">
            <StatLabel color="gray.600">Remaining Budget</StatLabel>
            <StatNumber color="gray.800">৳{budget?.remainingBudget?.toFixed(2) || '0.00'}</StatNumber>
            <StatHelpText color="gray.600">
              Available to spend
            </StatHelpText>
          </Stat>
        </GridItem>
      </Grid>

      {/* Budget Progress */}
      <Box p={6} borderWidth="1px" borderRadius="lg" bg="white" mb={6}>
        <VStack spacing={4}>
          <HStack justify="space-between" width="100%">
            <Text fontSize="xl" fontWeight="bold">
              Budget Progress
            </Text>
            <Badge 
              colorScheme={getProgressColor(budgetPercentage)} 
              fontSize="sm"
              px={3}
              py={1}
            >
              {getBudgetStatus()}
            </Badge>
          </HStack>
          
          <Box width="100%">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" color="gray.600">
                {budgetPercentage.toFixed(1)}% used
              </Text>
              <Text fontSize="sm" color="gray.600">
                ৳{budget?.spentAmount?.toFixed(2) || '0'} / ৳{budget?.totalBudget?.toFixed(2) || '0'}
              </Text>
            </HStack>
            <Progress 
              value={budgetPercentage} 
              colorScheme={getProgressColor(budgetPercentage)}
              size="lg"
              borderRadius="md"
            />
          </Box>
        </VStack>
      </Box>

      {/* Action Buttons */}
      <HStack justify="center" spacing={4} mb={8}>
        <Button 
          colorScheme="blue" 
          size="lg"
          onClick={onOpen}
        >
          {budget?.totalBudget > 0 ? 'Update Budget' : 'Set Budget'}
        </Button>
      </HStack>

      {/* Divider */}
      <Divider my={8} />

      {/* Monthly Transaction History */}
      {budget && budget.totalBudget > 0 && (
        <MonthlyTransactionHistory 
          month={currentDate.getMonth() + 1} 
          year={currentDate.getFullYear()}
          onBalanceUpdate={() => fetchBudget()} // Refresh budget when transactions are deleted
        />
      )}

      {/* Budget Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {budget?.totalBudget > 0 ? 'Update Monthly Budget' : 'Set Monthly Budget'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text color="gray.600" textAlign="center">
                Set your budget for {currentMonthName} {currentYear}
              </Text>
              <FormControl>
                <FormLabel>Budget Amount (৳)</FormLabel>
                <Input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="Enter your monthly budget"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={updateBudget}
              isLoading={updating}
              loadingText="Updating..."
            >
              {budget?.totalBudget > 0 ? 'Update Budget' : 'Set Budget'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default Budget
