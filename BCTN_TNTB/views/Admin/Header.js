import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';

const Header = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [reloadUserData, setReloadUserData] = useState(false); 

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userQuerySnapshot = await firestore().collection('user').get();
                userQuerySnapshot.forEach(doc => {
                    const user = doc.data();
                    setUsername(user.name);
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [reloadUserData]); 

    const handleReload = () => {
        setReloadUserData(prevState => !prevState); 
    };

    return (
        <View style={styles.upperView}>
            <Text style={styles.username}>Xin Chào! {username || 'Người Dùng'}</Text>
            <TouchableOpacity onPress={handleReload}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="reload" size={25} color="black" />
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="account-cog" size={25} color="black" />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    upperView: {
        width: '100%',
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#00CCCC',
        alignItems: 'center',
    },
    username: {
        marginRight: 'auto',
        marginLeft: 10,
        fontSize: 18,
        fontWeight: 'bold',
        color:'#FFFF99'
    },
    iconContainer: {
        padding: 5,
    },
});

export default Header;
