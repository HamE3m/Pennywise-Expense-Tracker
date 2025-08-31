import {Container, Flex, Text, HStack, Button, VStack, Box} from '@chakra-ui/react'
import {Link, useNavigate, useLocation} from 'react-router-dom'
import {useAuth} from '../context/AuthContext'
import {MdDashboard, MdAccountBalanceWallet, MdAccountBalance, MdPerson, MdLogin } from 'react-icons/md'


const Navbar = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const handleHomeClick = () => {
    navigate('/home')
  }
  const isActive = (path) => {
    return location.pathname === path
  }
  const getTabStyle = (path) => {
    const isTabActive = isActive(path)
    return {
      color: isTabActive ? '#5F8575' : 'gray.600',
      bg: isTabActive ? '#E8F2EF' : 'transparent',
      borderRadius: 'lg',
      p: 2,
      _hover: { color: '#5F8575',bg: isTabActive ? '#D1E7DD' : 'gray.50'},
      transition: 'all 0.2s',
      transform: isTabActive ? 'translateY(-1px)' : 'none',
      shadow: isTabActive ? 'sm' : 'none'
    }
  }
  return (
    <Box 
      bg="white" 
      shadow="lg" 
      position="sticky" 
      top="0" 
      zIndex="1000"
      borderBottom="1px"
      borderBottomColor="gray.200"
    >
      <Container maxW={"2560px"} px={4}>
        <Flex
          h={16}
          alignItems={"center"}
          justifyContent={"space-between"}
          w="full"
        >
        <Text
          fontSize={{ base: "26", sm: "32" }}
          fontWeight={"normal"}
          bgGradient="linear(to-t, #1C495E, #17694D)"
          bgClip="text"
          fontFamily="'Limelight', cursive"
        >
          <Link to={"/"}>PennyWise</Link>
        </Text>
        <HStack spacing={8} justifyContent="flex-end">
          <Link to="/home">
            <VStack spacing={1} align="center" sx={getTabStyle('/home')}>
              <MdDashboard size={24} />
              <Text fontSize="sm" fontWeight="medium">Dashboard</Text>
            </VStack>
          </Link>
          {user ? (
            <>
              <Link to={"/transactions"}>
                <VStack spacing={1} align="center" sx={getTabStyle('/transactions')}>
                  <MdAccountBalanceWallet size={24} />
                  <Text fontSize="sm" fontWeight="medium">Transactions</Text>
                </VStack>
              </Link>
              <Link to={"/budget"}>
                <VStack spacing={1} align="center" sx={getTabStyle('/budget')}>
                  <MdAccountBalance size={24} />
                  <Text fontSize="sm" fontWeight="medium">Budget</Text>
                </VStack>
              </Link>
              <Link to={"/profile"}>
                <VStack spacing={1} align="center" sx={getTabStyle('/profile')}>
                  <MdPerson size={24} />
                  <Text fontSize="sm" fontWeight="medium">Profile</Text>
                </VStack>
              </Link>
            </>
          ) : (
            <Link to={"/login"}>
              <VStack spacing={1} align="center" sx={getTabStyle('/login')}>
                <MdLogin size={24} />
                <Text fontSize="sm" fontWeight="medium">Login</Text>
              </VStack>
            </Link>
          )}
        </HStack>
      </Flex>
    </Container>
    </Box>
  )
}

export default Navbar
