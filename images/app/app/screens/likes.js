import { View, Text, StyleSheet } from 'react-native'

const Likes = () => {
    return (
        <View style={styles.container}>
            <Text> Likes </Text>
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

export default Likes