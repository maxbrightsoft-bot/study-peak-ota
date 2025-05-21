import DoTextbook from "@/containers/DoTextbook"

type Props = {
  route: any;
};

const DoTextbookScreen = ({ route }: Props) => {
  const textbookId = route?.params?.textbookId;
  const page = route?.params?.page;
  
  return (
    <DoTextbook textbookId={textbookId} page={page}/>
  )
}

export default DoTextbookScreen