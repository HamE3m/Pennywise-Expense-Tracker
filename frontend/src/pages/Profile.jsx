import {Container, Box, Text, VStack, HStack, Divider, Button, useToast, Input, FormControl, FormLabel} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Profile = () => {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    newPassword: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleEdit = () => {
    setIsEditing(true)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      newPassword: ''
    })
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      
      if (data.success) {
        login(data.user)
        setIsEditing(false)
        toast({title: 'Profile updated successfully', status: 'success', duration: 3000})
      } else {
        toast({title: 'Error', description: data.message, status: 'error', duration: 3000})
      }
    } catch (error) {
      toast({title: 'Error', description: 'Could not update profile', status: 'error', duration: 3000})
    }
  }

  const handleLogout = () => {
    logout()
    toast({title: 'Logged out successfully', status: 'success', duration: 3000})
    navigate('/login')
  }

return (
    <Container maxW="container.md" py={8}>
      <Text
        fontSize={{ base: "22", sm: "28" }}
        fontWeight={"bold"}
        textAlign={"center"}
        color={"black"}
        mb={8}
      >Profile Information</Text>
      
      <Box borderWidth="1px" borderRadius="lg" p={8}>
        {user ? (
          <VStack spacing={4} align="stretch">
            {isEditing ? (
              <>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Current Password</FormLabel>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>New Password (Optional)</FormLabel>
                  <Input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </FormControl>
                <HStack spacing={4}>
                  <Button colorScheme="green" onClick={handleSave}>
                    Save Changes
                  </Button>
                  <Button onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </HStack>
              </>
            ) : (
              <>
                <HStack justify="space-between">
                  <Text fontWeight="bold">User ID:</Text>
                  <Text>{user.id}</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontWeight="bold">Name:</Text>
                  <Text>{user.name}</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontWeight="bold">Email:</Text>
                  <Text>{user.email}</Text>
                </HStack>
                <Button colorScheme="blue" onClick={handleEdit} mt={4}>
                  Edit Profile
                </Button>
                <Button colorScheme="red" onClick={handleLogout} mt={4}>
                  Logout
                </Button>
              </>
            )}
          </VStack>
        ) : (
          <Text textAlign="center">Please log in to view profile</Text>
        )}
      </Box>
    </Container>
  )
}

export default Profile