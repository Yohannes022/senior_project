import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { User } from '../config/firebase';
import { addDocument, getDocuments, updateDocument, deleteDocument } from '../utils/firebaseUtils';
import { collections } from '../config/firebase';

const UserManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const userList = await getDocuments<User>(collections.users);
      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSubmit = async () => {
    if (!name || !email) return;

    try {
      if (editingId) {
        // Update existing user
        await updateDocument(collections.users, editingId, { name, email });
      } else {
        // Add new user
        await addDocument(collections.users, { name, email });
      }
      
      // Reset form and reload users
      setName('');
      setEmail('');
      setEditingId(null);
      await loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleEdit = (user: User) => {
    if (!user.id) return;
    setName(user.name);
    setEmail(user.email);
    setEditingId(user.id);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(collections.users, id);
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Management</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Button
          title={editingId ? 'Update User' : 'Add User'}
          onPress={handleSubmit}
        />
        {editingId && (
          <Button
            title="Cancel"
            onPress={() => {
              setName('');
              setEmail('');
              setEditingId(null);
            }}
            color="#999"
          />
        )}
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id || ''}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <View>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            <View style={styles.userActions}>
              <Button title="Edit" onPress={() => handleEdit(item)} />
              <Button 
                title="Delete" 
                onPress={() => item.id && handleDelete(item.id)} 
                color="red"
              />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    color: '#666',
  },
  userActions: {
    flexDirection: 'row',
    gap: 10,
  },
});

export default UserManager;
