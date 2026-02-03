import DoTextbook from "@/containers/DoTextbook"

type Props = {
  route: any;
};

const DoTextbookScreen = ({ route }: Props) => {
  const textbookId = route?.params?.textbookId;
  const page = route?.params?.page;
  const reqTime = route?.params?.reqTime
  const restart = route?.params?.restart
  
  return (
    <DoTextbook textbookId={textbookId} page={page} reqTime={reqTime} restart={restart}/>
  )
}

export default DoTextbookScreen