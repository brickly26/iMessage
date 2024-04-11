import { useMutation } from "@apollo/client";
import {
  Input,
  Button,
  Text,
  Stack,
  Link,
  InputRightElement,
  InputGroup,
  IconButton,
} from "@chakra-ui/react";
import React, { useState } from "react";
import userOperations from "../../graphql/operations/user";
import toast from "react-hot-toast";
import { RegisterData, RegisterVariables } from "../../util/types";
import {
  LENGTH_REGEX,
  NUMBER_REGEX,
  SPECIAL_CHARS_REGEX,
  UPPERCASE_REGEX,
} from "../../util/regex";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useRouter } from "next/router";

interface RegisterProps {
  reloadSession: () => void;
  setAuthPage: React.Dispatch<React.SetStateAction<string>>;
}

const Register: React.FC<RegisterProps> = ({ reloadSession, setAuthPage }) => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordLengthValid, setPasswordLengthValid] = useState(false);
  const [passwordNumberValid, setPasswordNumberValid] = useState(false);
  const [passwordUppercaseValid, setPasswordUppercaseValid] = useState(false);
  const [passwordSpecialCharsValid, setPasswordSpecialCharsValid] =
    useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
  const [passwordFieldTouched, setPasswordFieldTouched] = useState(false);
  const [confirmPasswordFieldTouched, setConfirmPasswordFieldTouched] =
    useState(false);
  const [passwordShow, setPasswordShow] = useState(false);
  const [confirmPasswordShow, setConfirmPasswordShow] = useState(false);

  const [register, { loading, error }] = useMutation<
    RegisterData,
    RegisterVariables
  >(userOperations.Mutation.register);

  const onSubmit = async () => {
    if (!username || !password || !confirmPassword) return;

    setConfirmPasswordFieldTouched(true);
    setPasswordFieldTouched(true);

    //credential validation
    if (!passwordLengthValid) {
      toast.error("password must be at least 8 character");
      return;
    }

    if (!passwordNumberValid) {
      toast.error("password must contain a number");
      return;
    }

    if (!passwordUppercaseValid) {
      toast.error("password must contain an uppercase letter");
      return;
    }

    if (!passwordSpecialCharsValid) {
      toast.error("password must contain a special character");
      return;
    }

    setPasswordValid(true);

    if (confirmPassword !== password) {
      setConfirmPasswordValid(false);
      toast.error("Passwords must match");
      return;
    }

    setConfirmPasswordValid(true);

    try {
      const { data } = await register({
        variables: { username, password },
      });

      if (!data?.register) {
        throw new Error();
      }

      toast.success("Registered!");
      // reloade session to obtain new username
      await router.push({
        query: { conversationId: data.register.conversationId },
      });
      reloadSession();
    } catch (error: any) {
      console.log("Register", error);
      toast.error(error?.message);
    }
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const currPassword = e.target.value.replace(/\s/g, "");
    setPassword(currPassword);

    setPasswordLengthValid(LENGTH_REGEX.test(currPassword));
    setPasswordNumberValid(NUMBER_REGEX.test(currPassword));
    setPasswordSpecialCharsValid(SPECIAL_CHARS_REGEX.test(currPassword));
    setPasswordUppercaseValid(UPPERCASE_REGEX.test(currPassword));
  };

  const handleConfirmPasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const currPassword = e.target.value.replace(/\s/g, "");
    setConfirmPassword(currPassword);
  };

  return (
    <>
      <Text fontSize="3xl">Register</Text>
      <Input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <InputGroup>
        <Input
          errorBorderColor="red.300"
          isInvalid={passwordFieldTouched && !passwordValid}
          placeholder="Password"
          type={passwordShow ? "text" : "password"}
          value={password}
          onChange={handlePasswordInputChange}
        />
        <InputRightElement width="4.5rem">
          {passwordShow ? (
            <FaRegEyeSlash
              onClick={() => setPasswordShow(false)}
              cursor="pointer"
            />
          ) : (
            <FaRegEye onClick={() => setPasswordShow(true)} cursor="pointer" />
          )}
        </InputRightElement>
      </InputGroup>

      <InputGroup>
        <Input
          errorBorderColor="red.300"
          isInvalid={confirmPasswordFieldTouched && !confirmPassword}
          placeholder="Confirm Password"
          type={confirmPasswordShow ? "text" : "password"}
          value={confirmPassword}
          onChange={handleConfirmPasswordInputChange}
        />
        <InputRightElement width="4.5rem">
          {confirmPasswordShow ? (
            <FaRegEyeSlash
              onClick={() => setConfirmPasswordShow(false)}
              cursor="pointer"
            />
          ) : (
            <FaRegEye
              onClick={() => setConfirmPasswordShow(true)}
              cursor="pointer"
            />
          )}
        </InputRightElement>
      </InputGroup>

      <Stack width="100%" spacing={5} align="end">
        <Button onClick={onSubmit} width="100%" isLoading={loading}>
          Register
        </Button>
        <Text>
          Already have an account?
          <Link
            textDecoration="underline"
            onClick={() => setAuthPage("login")}
            pl={2}
          >
            Login
          </Link>
        </Text>
      </Stack>
    </>
  );
};

export default Register;
