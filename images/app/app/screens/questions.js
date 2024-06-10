import { View, Text, StyleSheet } from 'react-native'

const Questions = () => {
    return (
        <View style={styles.container}>
            <Text>Questions</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default Questions