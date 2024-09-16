
import { View, Text,  StyleSheet, Pressable, Dimensions, Modal, Button } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import DropdownAlert, { DropdownAlertData, DropdownAlertType, } from 'react-native-dropdownalert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';


const IconButton = (props : any) => {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: props.disabled
            ? "#ccc"
            : pressed
            ? "#9699b0"
            : '#404462',
        },
        styles.container,
        props.buttonStyles,
      ]}
      disabled={props.disabled}
      onPress={props.onPress}
      accessible
      accessibilityLabel={props.accessibilityLabel || "A Button"}
    >
      <View style={{gap: 14, alignItems:  'center', flexDirection: 'column', justifyContent: 'space-between'}}>
        {props.iconSuplier === FontAwesome5 ? 
        <FontAwesome5 name={props.icon} size={20} color="white" /> 
        : 
        <MaterialCommunityIcons name={props.icon} size={25} color="white" />}
        <Text style={[styles.text, props.textStyles]}>
          {props.title || "Press Me"}
        </Text>
      </View>
    </Pressable>
  );
};

const KeyModel = {
  vkc: "",
  private_key: "",
  public_hash: "",
  created_at: "",
};


export default function KeysScreen() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const toggleShowPassword = () => {
      setShowPassword(!showPassword);
      showPassword ? setPassword(keys.vkc) : setPassword('···· ···· ······ ······ ······· ······· ··················');
  };

  let alert = (_data: DropdownAlertData) => new Promise<DropdownAlertData>(res => res);

  const [keys, setKeys] = useState(KeyModel);
  const [modalVisible, setModalVisible] = useState(false);
  const handleCloseModal = () => { setModalVisible(false); }
  const generateKeys = async () => {
    const newKeys = await fetch('https://d9ca-79-117-157-51.ngrok-free.app/create-keys', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((newKeys) => newKeys.json())
    .then((data) => {
      KeyModel.private_key = data.private_key;
      KeyModel.public_hash = data.public_hash;
    })
    .catch((error) => {
      console.error('Error:', error);
    });

    console.log(KeyModel.public_hash);

    const newVKC = fetch(`https://d9ca-79-117-157-51.ngrok-free.app/generate-keycode/${KeyModel.public_hash}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((newVKC) => newVKC.json())
    .then((data) => {
      console.log(data);
      KeyModel.vkc = data.keycode;
      AsyncStorage.setItem('keys', JSON.stringify(KeyModel));
      setModalVisible(false);

      setKeys(KeyModel);
      setPassword(KeyModel.vkc);
    }).catch((error) => {
      console.error('Error:', error);
    });
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar datos desde AsyncStorage
        const stored_keys = await AsyncStorage.getItem('keys');
        if (stored_keys !== null) {
          // Si hay datos, guardarlos en el estado
          setKeys(JSON.parse(stored_keys));
          setPassword(keys.vkc);
        } else {
          // Si no hay datos, mostrar el modal
          setModalVisible(true);
        }
      } catch (error) {
        console.error('Error loading data', error);
      }
    }

    fetchData();
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#404462' }}>
      <SafeAreaView style={{ backgroundColor: '#404462' }}>
      </SafeAreaView>
      <View style={{  backgroundColor: '#696b86'}}>
        <Text style={styles.header}>VKC ACTIVO</Text>
        <View style={{
              marginHorizontal : Dimensions.get('window').width / 18,
              marginTop: 16,
              backgroundColor: '#404462',
              borderRadius: 8,
            }}>
          <Text style={{
              color: 'white',
              fontSize: showPassword ? 44 : 24,
              lineHeight: showPassword ? 40 : 40,
              paddingTop: showPassword ? 26 : 16,
              padding: 16,
              fontFamily: 'Avenir-Roman',
              fontWeight: 'bold',
              textAlign: 'center',
              }}>
            {password}
          </Text>
        </View>
        <View style={{flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between', marginHorizontal : Dimensions.get('window').width / 18, marginTop: 16, gap: 16}}>
          <IconButton
              title={showPassword ? "Mostrar" : "Ocultar"} 
              iconSuplier={FontAwesome5}
              icon={showPassword ? "eye" : "eye-slash"} 
              onPress={() => {toggleShowPassword()}}
              accessibilityLabel="Learn more about this purple button"
            />
            <IconButton
              title="Copiar"
              iconSuplier={FontAwesome5}
              icon="copy"
              onPress={async () => { 
                await Clipboard.setStringAsync(password); 
                await alert({
                  type: DropdownAlertType.Success,
                  title: 'Éxito',
                  message: 'Su clave ha sido copiada al portapapeles',
              });}}
              accessibilityLabel="Learn more about this purple button"
            />
            <IconButton
              title="Regenerar"
              iconSuplier={MaterialCommunityIcons}
              icon="reload"
              onPress={ async () => { await AsyncStorage.removeItem('keys'); setModalVisible(true); setPassword('');}}
              accessibilityLabel="Learn more about this purple button"
            />
        </View>
    </View>
    <View style={{ flex: 2,  backgroundColor: '#696b86'}}>
        <Text style={styles.header}>HISTORIAL DE CLAVES</Text>
        <View style={styles.keyContainer}>
          <IconButton
            title="CONSULTAR  CLAVE"
            iconSuplier={FontAwesome5}
            icon="eye"
            accessibilityLabel="Learn more about this purple button"
          />
        </View>
    </View>
    <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{lineHeight: 20}}>No se encontró ninguna clave almacenada en el almacenamiento del dispostivo.</Text>
            <Text style={{margin: 14, fontWeight: 'bold'}}>¿Deseas solicitar un nuevo VKC?</Text>
            <Button title="Generar" onPress={generateKeys} />
          </View>
        </View>
      </Modal>
    <DropdownAlert alert={func => (alert = func)} />
  </View>
  );
}

const styles = StyleSheet.create({
  text: { 
    color: "white", 
    fontSize: 16,  
    fontFamily: 'Avenir-Roman' 
  },
  container: {
    padding: 24,
    paddingVertical: 24,
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
  },
  title: {
    fontSize: 48,
    marginHorizontal: Dimensions.get('window').width / 18,
    textAlign: 'center',
    color: '#C2A33E',
    fontWeight: 'bold',
    fontFamily: 'Avenir-Book',
    marginTop: 16,
  },
  header: {
    backgroundColor: '#696b86', 
    paddingTop: 32,  
    marginHorizontal: Dimensions.get('window').width / 18, 
    color: 'white', 
    fontSize: 24,
    fontFamily: 'Avenir-Roman',
    fontWeight: 'bold',
  },
  keyContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
    marginHorizontal: Dimensions.get('window').width / 18, 
    marginTop: 16,
  },
  input: {
      flex: 1,
      color: '#333',
      paddingVertical: 10,
      paddingRight: 10,
      fontSize: 24,
  },
  icon: {
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
});