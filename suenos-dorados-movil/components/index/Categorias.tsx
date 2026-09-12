import { View } from "react-native";
import CategoryChips from "../ui/Categorychips";

interface Props {
  active: string;
  onSelect: (id: string) => void;
}

export default function Categorias({ active, onSelect }: Props) {
  return (
    <View style={{ marginBottom: 40 }   }>
      <CategoryChips active={active} onSelect={onSelect} useIds={true} />
    </View>
  );
}