import { Flex, Stack, Text } from "@chakra-ui/react";
import * as React from "react";
import { SearchedUser } from "../../../../util/types";

interface UserSearchListProps {
  users: Array<SearchedUser>;
}

const UserSearchList: React.FunctionComponent<UserSearchListProps> = ({
  users,
}) => {
  return (
    <>
      {users.length === 0 ? (
        <Flex mt={6} justify="center">
          <Text>No users found</Text>
        </Flex>
      ) : (
        <Stack mt={6}>
          {users.map((user) => (
            <Stack
              direction="row"
              align="center"
              spacing={4}
              py={2}
              px={4}
              borderRadius={4}
            ></Stack>
          ))}
        </Stack>
      )}
    </>
  );
};

export default UserSearchList;
