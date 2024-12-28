import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';

const HeaderCustomer = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [reloadUserData, setReloadUserData] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // console.log('Fetching user data...'); // Thêm dòng này để kiểm tra
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
    
    return (
        <View style={styles.upperView}>
            <Text style={styles.username}>Xin Chào! {username || 'Guest'}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileCustomer')}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="account-circle" size={25} color="white" />
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
        backgroundColor: '#1C86EE',
        alignItems: 'center',
        height:65,
    },
    username: {
        marginRight: 'auto',
        marginLeft: 10,
        fontSize: 18,
        fontWeight: 'bold',
        color:'white',
        marginTop:10
    },
    iconContainer: {
        padding: 5,
        color:'white',
        marginTop:10
    },
});

export default HeaderCustomer;
