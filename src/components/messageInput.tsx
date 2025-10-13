import { IconButton } from "./iconButton";

type Props = {
  userMessage: string;
  isChatProcessing: boolean;
  isMicRecording: boolean;
  onKeyDownUserMessage: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onChangeUserMessage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClickMicButton: () => void;
  onClickSendButton: () => void;
};

export const MessageInput = ({
  userMessage,
  isChatProcessing,
  isMicRecording,
  onKeyDownUserMessage,
  onChangeUserMessage,
  onClickMicButton,
  onClickSendButton,
}: Props) => {
  return (
    <div className="absolute bottom-0 z-20 w-full">
      <div className="bg-base px-16 pb-16 pt-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-flow-col gap-[8px] grid-cols-[min-content_1fr_min-content]">
            <IconButton
              iconName="24/Microphone"
              className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
              isProcessing={isMicRecording}
              disabled={isChatProcessing}
              onClick={onClickMicButton}
            />
            <input
              type="text"
              placeholder="Type a message..."
              onChange={onChangeUserMessage}
              onKeyDown={onKeyDownUserMessage}
              disabled={isChatProcessing}
              value={userMessage}
              className="bg-surface1 hover:bg-surface1-hover focus:bg-surface1 disabled:bg-surface1-disabled disabled:text-primary-disabled text-text-primary px-16 py-8 rounded-oval"
            ></input>
            <IconButton
              iconName="24/Send"
              className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
              isProcessing={isChatProcessing}
              disabled={isChatProcessing || !userMessage}
              onClick={onClickSendButton}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
