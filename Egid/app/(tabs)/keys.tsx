
import { View, Text,  StyleSheet, Pressable, Dimensions } from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import DropdownAlert, { DropdownAlertData, DropdownAlertType, } from 'react-native-dropdownalert';
import React, { useState } from 'react';


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

export default function KeysScreen() {
  // State variable to hold the password
  const [password, setPassword] = useState('fc12  ydo9  5yykc  27ycro  3dmqn08  4r8unt48f  1tp2r57ohc7m73gdzc');

  // State variable to track password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Function to toggle the password visibility state
  const toggleShowPassword = () => {
      setShowPassword(!showPassword);
      showPassword ? setPassword('fc12  ydo9  5yykc  27ycro  3dmqn08  4r8unt48f  1tp2r57ohc7m73gdzc') : setPassword('···· ···· ······ ······ ······· ······· ··················');
  };

  let alert = (_data: DropdownAlertData) => new Promise<DropdownAlertData>(res => res);

  return (
    <View style={{ flex: 1, backgroundColor: '#404462' }}>
      <SafeAreaView style={{ backgroundColor: '#404462' }}>
      </SafeAreaView>
      <View style={{  backgroundColor: '#696b86'}}>
        <Text style={styles.header}>CLAVE ACTIVA</Text>
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
              onPress={() => {}}
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
});