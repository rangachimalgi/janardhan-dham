import { View, Text, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import HallTile from "../components/HallTile";

export default function HomeScreen() {
  const navigation = useNavigation();
  const handlePress = (hall) => {
    navigation.navigate("CreateEvent", { hall });
  };
  const halls = [
  { id: "BIG_1", name: "Vrindavana Main Hall", subname: "2nd Floor", icon: "business" },
  { id: "BIG_2", name: "Vrindavana Mini Hall", subname: "2nd Floor", icon: "business" },
  { id: "MINI_1", name: "Kamadhenu Main Hall", subname: "3rd Floor", icon: "business" },
  { id: "MINI_2", name: "Kamadhenu Mini Hall", subname: "3rd Floor", icon: "business" },
  { id: "HOMA_1", name: "Homa Hall", subname: "4th Floor", icon: "business" },
];


  return (
    <SafeAreaView style={styles.container}>
      {/* Identity Section */}
      <View style={styles.identity}>
        <Text style={styles.title}>Sri Raghavendra Swamy</Text>
        <Text style={styles.subtitle}>Vrindavana Samithi Kachiguda, Hyderabad</Text>

        <Image source={require("../../assets/logo.png")} style={styles.logo} />
      </View>

      {/* Tiles */}
      <View style={styles.grid}>
        {halls.map((hall) => (
          <HallTile
            key={hall.id}
            title={hall.name}
            subname={hall.subname} 
            subtitle={hall.status}
            icon={hall.icon}
            onPress={() => handlePress(hall)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  identity: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 200,
    borderRadius: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
