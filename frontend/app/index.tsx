import { Button, Text, View } from "react-native";

export default function Index(){
    return(
        <View>
            <Text className="text-red-500">Hola</Text>
            <Button 
                title="Presionar" 
                onPress={() => alert("¡Botón presionado!")} 
            />
        </View>
        
    );
}
