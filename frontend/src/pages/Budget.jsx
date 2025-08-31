import {useState, useEffect} from 'react'
import {Container, Box, Text, VStack, HStack, Button, FormControl, FormLabel, Input, useToast, Stat, StatLabel, StatNumber, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure} from '@chakra-ui/react'
import {useAuth} from '../context/AuthContext'
import MonthlySpendingChart from '../components/MonthlySpendingChart'
import MonthlyTransactionHistory from '../components/MonthlyTransactionHistory'


const Budget = () => {
  const { user } = useAuth()
  const [budget, setBudget] = useState(null)
  const [budgetAmount, setBudgetAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const currentDate = new Date()
  const isCurrentMonth = selectedMonth === currentDate.getMonth() + 1 && selectedYear === currentDate.getFullYear()


  const getMonthName = (monthNum) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return months[monthNum - 1]
  }
  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }
  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }
  const goToCurrentMonth = () => {
    setSelectedMonth(currentDate.getMonth() + 1)
    setSelectedYear(currentDate.getFullYear())
  }
  const fetchBudget = async (month = selectedMonth, year = selectedYear) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/budget/${user.id}?month=${month}&year=${year}`)
      const data = await response.json()
      if (data.success) {
        setBudget(data.data)
        setBudgetAmount(data.data.totalBudget.toString())
      } else {
        setBudget(null)
        setBudgetAmount('0')
      }
    } catch (error) {
      toast({title: 'Error', description: 'Could not load budget', status: 'error', duration: 3000})
    } finally {
      setLoading(false)
    }
  }


  const updateBudget = async () => {
    if (!budgetAmount || parseFloat(budgetAmount) < 0) {
      toast({title: 'Error', description: 'Please enter a valid budget amount', status: 'error', duration: 3000})
      return
    }
    try {
      setUpdating(true)
      const response = await fetch(`http://localhost:5000/api/budget/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalBudget: parseFloat(budgetAmount),
          month: selectedMonth,
          year: selectedYear
        })
      })
      const data = await response.json()
      if (data.success) {
        setBudget(data.data)
        onClose()
        toast({title: 'Success', description: `Budget updated successfully for ${getMonthName(selectedMonth)} ${selectedYear}`, status: 'success', duration: 3000})
      } else {
        toast({title: 'Error', description: data.message || 'Could not update budget', status: 'error', duration: 3000})
      }
    } catch (error) {
      toast({title: 'Error', description: 'Could not update budget', status: 'error', duration: 3000})
    } finally {
      setUpdating(false)
    }
  }
  useEffect(() => {
    if (user) {
      fetchBudget()
    }
  }, [user])
  useEffect(() => {
    if (user) {
      fetchBudget(selectedMonth, selectedYear)
    }
  }, [selectedMonth, selectedYear, user])


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
        <Text textAlign="center" fontFamily="'Roboto', sans-serif">Loading budget...</Text>
      </Container>
    )
  }


  const budgetPercentage = budget && budget.totalBudget > 0 
    ? (budget.spentAmount / budget.totalBudget) * 100 
    : 0
  return (
    <Box 
      minH="100vh" 
      bgGradient="linear(to-t, #1C495E, #17694D)"
      fontFamily="'Roboto', sans-serif"
    >
      <Container maxW="container.lg" py={8}>
      <Box textAlign="center" mb={10}>
        <Text fontSize="4xl" fontWeight="bold" color="white" mb={2} fontFamily="'Roboto', sans-serif">
          Monthly Budget
        </Text>
        <HStack justify="center" align="center" spacing={4} mb={2}>
          <Button
            onClick={goToPreviousMonth}
            variant="outline"
            size="sm"
            minW="40px"
            px={2}
            _hover={{ bg: "whiteAlpha.200" }}
            fontSize="lg"
            color="white"
            borderColor="whiteAlpha.300"
          >
            ‹
          </Button>
          <VStack spacing={1}>
            <Text fontSize="xl" fontWeight="semibold" color="white" minW="200px" fontFamily="'Roboto', sans-serif">
              {getMonthName(selectedMonth)} {selectedYear}
            </Text>
            {!isCurrentMonth && (
              <Button
                size="xs"
                variant="ghost"
                colorScheme="whiteAlpha"
                onClick={goToCurrentMonth}
                fontSize="xs"
                color="gray.100"
                _hover={{ bg: "whiteAlpha.200" }}
              >
                Go to current month
              </Button>
            )}
          </VStack>
          <Button
            onClick={goToNextMonth}
            variant="outline"
            size="sm"
            minW="40px"
            px={2}
            _hover={{ bg: "whiteAlpha.200" }}
            fontSize="lg"
            color="white"
            borderColor="whiteAlpha.300"
          >
            ›
          </Button>
        </HStack>
      </Box>
      <Box mb={10}>
        <Stat p={4} borderWidth="1px" borderRadius="xl" bg="white" borderColor="gray.200" shadow="sm">
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={0} flex={1}>
              <StatLabel color="gray.600" fontSize="sm">
                {isCurrentMonth ? 'Monthly allocation' : `Budget for ${getMonthName(selectedMonth)} ${selectedYear}`}
              </StatLabel>
              <StatNumber color="gray.800" fontSize="xl">৳{budget?.totalBudget?.toFixed(2) || '0.00'}</StatNumber>
            </VStack>
            <Button 
              colorScheme="gray"
              variant="outline"
              bg="white"
              color="gray.700"
              borderColor="gray.300"
              size="sm"
              onClick={onOpen}
              flexShrink={0}
              px={4}
              py={3}
              fontSize="sm"
              fontWeight="medium"
              borderRadius="lg"
              _hover={{
                bg: "gray.50",
                borderColor: "gray.400"
              }}
              _active={{
                bg: "gray.100"
              }}
            >
              {budget?.totalBudget > 0 ? 'Update' : 'Set'}
            </Button>
          </HStack>
        </Stat>
      </Box>
      <Box mb={12}>
        <MonthlySpendingChart 
          month={selectedMonth} 
          year={selectedYear}
          budget={budget}
        />
      </Box>
      <Box 
        p={6} 
        borderWidth="1px" 
        borderRadius="xl" 
        bg="white" 
        borderColor="gray.200" 
        shadow="sm"
      >
        <MonthlyTransactionHistory 
          month={selectedMonth} 
          year={selectedYear}
          onBalanceUpdate={() => fetchBudget(selectedMonth, selectedYear)}
        />
      </Box>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {budget?.totalBudget > 0 ? 'Update Monthly Budget' : 'Set Monthly Budget'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text color="gray.600" textAlign="center" fontFamily="'Roboto', sans-serif">
                Set your budget for {getMonthName(selectedMonth)} {selectedYear}
              </Text>
              <FormControl>
                <FormLabel fontFamily="'Roboto', sans-serif">Budget Amount (৳)</FormLabel>
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
    </Box>
  )
}

export default Budget
