/*
// This wrapper can be used if you need to conditionally need
// to wrap JSX with module <wrapper>. Usage:
// <ConditionalWrapper
//    condition={true / false}
//    wrapper={children => <TheWrapper>{children}</TheWrapper>}
//  >
//    <JSX ...>
//  </ConditionalWrapper>
*/

const ConditionalWrapper = ({ condition, wrapper, children }) => {
    return condition ? wrapper(children) : children;
}

export default ConditionalWrapper;