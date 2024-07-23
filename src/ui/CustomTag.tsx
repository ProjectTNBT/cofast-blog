import { RxCross1 } from 'react-icons/rx';

function CustomTag({ classNames, tag, ...tagProps }: any) {
  return (
    <button type='button' className={classNames.tag} {...tagProps}>
      <RxCross1 />
      <span className={classNames.name}>{tag.label}</span>
    </button>
  );
}

export default CustomTag;
