import { ScreenLayout } from "@/components/ScreenLayout";
import { Button, ButtonText } from "@/components/ui/button";
import {
    FormControl,
    FormControlLabel,
    FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { Link } from "expo-router";
import { Text } from "react-native";

export default function SignIn() {
  return (
    <ScreenLayout>
      <VStack className="w-full flex-1 items-center justify-center gap-4">
        <Text className="w-full text-2xl font-bold">Sign In</Text>
        <FormControl className="w-full">
          <VStack className="w-full gap-4">
            <VStack className="w-full">
              <FormControlLabel>
                <FormControlLabelText>Email</FormControlLabelText>
              </FormControlLabel>
              <Input className="my-1 rounded-full">
                <InputField
                  type="text"
                  placeholder="jhondoe@gmail.com"
                  autoComplete="email"
                  //   {...register("email")}
                />
              </Input>
              {/* {errors.email && <Text>{errors.email.message}</Text>} */}
            </VStack>
            <VStack>
              <FormControlLabel>
                <FormControlLabelText>Password</FormControlLabelText>
              </FormControlLabel>
              <Input className="my-1 rounded-full">
                <InputField
                  type="password"
                  placeholder="password"
                  autoComplete="password"
                  //   {...register("password")}
                />
              </Input>
              {/* {errors.password && <Text>{errors.password.message}</Text>} */}
            </VStack>
            <Button onPress={() => {}} className="w-full rounded-full">
              <ButtonText>Sign In</ButtonText>
            </Button>
            {/* {errors.root && <Text>{errors.root.message}</Text>} */}
          </VStack>
        </FormControl>
        <Link href="/reset-password">Forgot password?</Link>
        <Text>Or</Text>
        <VStack className="w-full gap-4">
          <Button className="w-full rounded-full" variant="outline">
            <ButtonText>Sign in with Google</ButtonText>
          </Button>
          <Button className="w-full rounded-full" variant="outline">
            <ButtonText>Sign in with Apple</ButtonText>
          </Button>
        </VStack>
        <Text>
          Don't have an account?<Link href="/sign-up">Sign up</Link>
        </Text>
      </VStack>
    </ScreenLayout>
  );
}
