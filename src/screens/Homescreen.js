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
    { id: "F1_1", name: "Gr Floor", subname: "Room no 1", icon: "business" },
    { id: "F1_2", name: "Gr Floor", subname: "Room no 2", icon: "business" },
    { id: "F2_1", name: "1st Floor", subname: "Room no 3", icon: "business" },
    { id: "F2_2", name: "1st Floor", subname: "Room no 4", icon: "business" },
    { id: "F3_1", name: "Gr Floor", subname: "Mini Hall", icon: "business" },
    { id: "F3_2", name: "Gr Floor", subname: "Big Hall", icon: "business" },
    { id: "F1F_HALL", name: "1st Floor", subname: "Hall", icon: "business" },
    { id: "F2F_HALL", name: "2nd Floor", subname: "Hall", icon: "business" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Identity Section */}
      <View style={styles.identity}>
        <Text style={styles.title}>Sri Janardhan Dham</Text>
        {/* <Text style={styles.subtitle}>Vrindavana Samithi Kachiguda, Hyderabad</Text> */}

        {/* <Image source={require("../../assets/logo.png")} style={styles.logo} /> */}
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
