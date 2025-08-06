import { Container, Flex, Text, HStack, Button } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user } = useAuth()

  return (
    <Container maxW={"2560px"} px={4}>
      <Flex
        h={16}
        alignItems={"center"}
        justifyContent={"space-between"}
        w="full"
      >
        <Text
          fontSize={{ base: "22", sm: "28" }}
          fontWeight={"bold"}
          bgGradient={"linear(to-r, cyan.400, blue.500)"}
          bgClip={"text"}
        >
          <Link to={"/"}>PennyWise: Expense Tracker</Link>
        </Text>

        <HStack spacing={6} justifyContent="flex-end">
          <Link to={"/"}>Home</Link>
          {user ? (
            <>
              <Link to={"/transactions"}>Transactions</Link> {/* Update link */}
              <Link to={"/profile"}>Profile</Link>
            </>
          ) : (
            <Link to={"/login"}>Login</Link>
          )}
        </HStack>
      </Flex>
    </Container>
  )
}

export default Navbar
