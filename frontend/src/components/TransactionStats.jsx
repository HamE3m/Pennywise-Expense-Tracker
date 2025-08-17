import { useState, useEffect } from 'react'
import { 
  Box, 
  Grid, 
  GridItem,
  Text, 
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useToast
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

const TransactionStats = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    totalTransactions: 0,
    incomeTransactions: 0,
    expenseTransactions: 0
  })
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await fetch(`http://localhost:5000/api/transactions/${user.id}/stats`)
        const data = await response.json()
        
        if (data.success) {
          setStats(data.data)
        } else {
          toast({
            title: 'Error',
            description: 'Could not load statistics',
            status: 'error',
            duration: 3000
          })
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Could not load statistics',
          status: 'error',
          duration: 3000
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, toast])

  if (loading) {
    return (
      <Box textAlign="center" py={4}>
        <Text>Loading statistics...</Text>
      </Box>
    )
  }

  return (
    <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mb={8}>
      <GridItem>
        <Stat 
          p={4} 
          borderWidth="1px" 
          borderRadius="md" 
          bg="green.50" 
          borderColor="green.200"
        >
          <StatLabel color="green.600">Total Income</StatLabel>
          <StatNumber color="green.700">৳{stats.income.toFixed(2)}</StatNumber>
          <StatHelpText color="green.600">
            <StatArrow type="increase" />
            {stats.incomeTransactions} transactions
          </StatHelpText>
        </Stat>
      </GridItem>

      <GridItem>
        <Stat 
          p={4} 
          borderWidth="1px" 
          borderRadius="md" 
          bg="red.50" 
          borderColor="red.200"
        >
          <StatLabel color="red.600">Total Expenses</StatLabel>
          <StatNumber color="red.700">৳{stats.expenses.toFixed(2)}</StatNumber>
          <StatHelpText color="red.600">
            <StatArrow type="decrease" />
            {stats.expenseTransactions} transactions
          </StatHelpText>
        </Stat>
      </GridItem>

      <GridItem>
        <Stat 
          p={4} 
          borderWidth="1px" 
          borderRadius="md" 
          bg="blue.50" 
          borderColor="blue.200"
        >
          <StatLabel color="blue.600">Current Balance</StatLabel>
          <StatNumber color="blue.700">৳{stats.balance.toFixed(2)}</StatNumber>
          <StatHelpText color="blue.600">
            {stats.totalTransactions} total transactions
          </StatHelpText>
        </Stat>
      </GridItem>
    </Grid>
  )
}

export default TransactionStats
